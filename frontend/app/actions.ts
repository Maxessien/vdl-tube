"use server";

import { YouTubeToolkitError } from "@/src/utils/ytk";

/**
 * youtubetoolkit.com downloader client.
 *
 * Two entry points:
 *   1. getVideoInfo(url)            -> metadata + available video/audio options
 *   2. getDownloadUrl(info, option) -> direct file URL for one chosen option
 *
 * Server-side only: the upstream endpoints require cookies/CSRF and are not
 * CORS-open to browsers.
 */

const ORIGIN = "https://youtubetoolkit.com";
const PAGE_URL = `${ORIGIN}/tools/video-downloader-1080p`;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/** Which upstream engine the site asks for. `video_fast` is what the 1080p page uses. */
export type DownloadApi = "video_fast" | "video" | "shorts_fast" | "audio";

export interface DownloadOption {
  /** e.g. "video:1080" or "audio:128" — sent back as `download_mode`. */
  mode: string;
  /** Human label, e.g. "Video 1080p — 80.91 MB". */
  label: string;
  /** e.g. "1080p" or "mp3". */
  quality: string;
  /** e.g. "80.91 MB" (may be absent). */
  size?: string;
  /** Per-option progress handle required by the resolve step. */
  statusUrl?: string;
  kind: "video" | "audio";
}

export interface YtkVideoInfo {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  durationSeconds: number;
  thumbnail: string;
  watchUrl: string;
  shortsUrl: string;
  embedUrl: string;
  defaultMode: string;
  provider: string;
  videoOptions: DownloadOption[];
  audioOptions: DownloadOption[];
  /** All options in one list, video first. */
  options: DownloadOption[];
  /** Internal: which engine produced these options (needed by getDownloadUrl). */
  downloadApi: DownloadApi;
}

export interface ResolvedDownload {
  downloadUrl: string;
  fileName: string;
  type: string;
  quality: string;
  provider: string;
}

export interface GetDownloadUrlOptions {
  /** How many times to re-ask while the file is still being prepared. Default 10. */
  maxAttempts?: number;
  /** Delay between attempts in ms. Default 15000. */
  retryDelayMs?: number;
  signal?: AbortSignal;
}

/* ------------------------------------------------------------------ */
/* session (csrf token + cookies)                                      */
/* ------------------------------------------------------------------ */

interface Session {
  csrf: string;
  cookie: string;
  routes: { analyze: string; resolve: string };
}

let cachedSession: Session | null = null;

function parseCookies(response: Response, previous: string): string {
  const jar = new Map<string, string>();
  for (const part of previous.split("; ").filter(Boolean)) {
    const eq = part.indexOf("=");
    if (eq > 0) jar.set(part.slice(0, eq), part.slice(eq + 1));
  }
  // Undici exposes getSetCookie(); fall back to the joined header.
  const raw: string[] =
    typeof (response.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (
          response.headers as unknown as { getSetCookie: () => string[] }
        ).getSetCookie()
      : (response.headers.get("set-cookie") ?? "").split(/,(?=[^;]+?=)/);

  for (const entry of raw) {
    const pair = entry.split(";")[0]?.trim();
    if (!pair) continue;
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  return [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function createSession(signal?: AbortSignal): Promise<Session> {
  const response = await fetch(PAGE_URL, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: signal ?? null,
  });
  if (!response.ok) {
    throw new YouTubeToolkitError(
      `Could not load the downloader page (${response.status}).`,
    );
  }
  const cookie = parseCookies(response, "");
  const html = await response.text();

  const match = html.match(
    /id=["']ytk-direct-downloader-config["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) {
    throw new YouTubeToolkitError(
      "Downloader configuration not found on the page.",
    );
  }

  let config: {
    csrf?: string;
    routes?: { analyze?: string; resolve?: string };
  };
  try {
    config = JSON.parse(match[1].trim());
  } catch {
    throw new YouTubeToolkitError(
      "Downloader configuration could not be parsed.",
    );
  }

  if (!config.csrf || !config.routes?.analyze || !config.routes?.resolve) {
    throw new YouTubeToolkitError("Downloader configuration is incomplete.");
  }

  return {
    csrf: config.csrf,
    cookie,
    routes: { analyze: config.routes.analyze, resolve: config.routes.resolve },
  };
}

async function getSession(signal?: AbortSignal): Promise<Session> {
  if (!cachedSession) cachedSession = await createSession(signal);
  return cachedSession;
}

async function postJson<T>(
  pick: (session: Session) => string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  let session = await getSession(signal);

  const send = async (s: Session) =>
    fetch(pick(s), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-TOKEN": s.csrf,
        "X-Requested-With": "XMLHttpRequest",
        Origin: ORIGIN,
        Referer: PAGE_URL,
        "User-Agent": USER_AGENT,
        Cookie: s.cookie,
      },
      body: JSON.stringify(body),
      signal: signal ?? null,
    });

  let response = await send(session);

  // Expired session / CSRF mismatch -> refresh once.
  if (
    response.status === 419 ||
    response.status === 401 ||
    response.status === 403
  ) {
    cachedSession = null;
    session = await getSession(signal);
    response = await send(session);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new YouTubeToolkitError(
      `Request failed (${response.status}). ${text.slice(0, 200)}`.trim(),
    );
  }

  session.cookie = parseCookies(response, session.cookie);
  return (await response.json()) as T;
}

/* ------------------------------------------------------------------ */
/* 1. video info                                                       */
/* ------------------------------------------------------------------ */

interface RawOption {
  mode: string;
  label?: string;
  quality?: string;
  size?: string;
  status_url?: string;
}

interface AnalyzeResponse {
  success: boolean;
  message?: string;
  service_available?: boolean;
  data?: {
    video_id: string;
    title?: string;
    channel_title?: string;
    duration?: string;
    duration_seconds?: number;
    thumbnail?: string;
    watch_url?: string;
    shorts_url?: string;
    embed_url?: string;
    default_mode?: string;
    provider?: string;
    video_options?: RawOption[];
    audio_options?: RawOption[];
  };
}

function mapOption(raw: RawOption, kind: "video" | "audio"): DownloadOption {
  return {
    mode: raw.mode,
    label: raw.label ?? raw.mode,
    quality: raw.quality ?? raw.mode.split(":")[1] ?? "",
    ...(raw.size ? { size: raw.size } : {}),
    ...(raw.status_url ? { statusUrl: raw.status_url } : {}),
    kind,
  };
}

/** Extract the 11-character video id from any common YouTube URL form. */
export function extractVideoId(input: string): string | null {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Fetch metadata and all available download options for a YouTube video.
 */
export async function getVideoInfo(
  url: string,
  options: { downloadApi?: DownloadApi; signal?: AbortSignal } = {},
): Promise<YtkVideoInfo> {
  const downloadApi = options.downloadApi ?? "video_fast";

  if (!extractVideoId(url)) {
    throw new YouTubeToolkitError(
      "That does not look like a YouTube video URL.",
    );
  }

  const json = await postJson<AnalyzeResponse>(
    (s) => s.routes.analyze,
    { url: url.trim(), download_api: downloadApi },
    options.signal,
  );

  if (!json.success || !json.data) {
    throw new YouTubeToolkitError(
      json.message || "Could not analyze this URL.",
    );
  }

  const d = json.data;
  const videoOptions = (d.video_options ?? []).map((o) =>
    mapOption(o, "video"),
  );
  const audioOptions = (d.audio_options ?? []).map((o) =>
    mapOption(o, "audio"),
  );

  return {
    videoId: d.video_id,
    title: d.title ?? "",
    channelTitle: d.channel_title ?? "",
    duration: d.duration ?? "",
    durationSeconds: d.duration_seconds ?? 0,
    thumbnail: d.thumbnail ?? "",
    watchUrl: d.watch_url ?? `https://www.youtube.com/watch?v=${d.video_id}`,
    shortsUrl: d.shorts_url ?? "",
    embedUrl: d.embed_url ?? "",
    defaultMode: d.default_mode ?? videoOptions[0]?.mode ?? "",
    provider: d.provider ?? "",
    videoOptions,
    audioOptions,
    options: [...videoOptions, ...audioOptions],
    downloadApi,
  };
}

/* ------------------------------------------------------------------ */
/* 2. direct download url                                              */
/* ------------------------------------------------------------------ */

interface ResolveResponse {
  success: boolean;
  message?: string;
  limit_reached?: boolean;
  data?: {
    status?: "redirect" | "preparing" | string;
    message?: string;
    download_url?: string;
    file_name?: string;
    provider?: string;
    mode_type?: string;
    mode_quality?: string;
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Turn one option from getVideoInfo() into a direct download URL.
 *
 * The upstream service prepares the file on demand, so this polls while the
 * response says "preparing" (default: up to 10 tries, 15s apart).
 *
 * @param option a DownloadOption object, or its `mode` string (e.g. "video:1080")
 */
export async function getDownloadUrl(
  info: YtkVideoInfo,
  option: DownloadOption | string,
  opts: GetDownloadUrlOptions = {},
): Promise<ResolvedDownload> {
  const maxAttempts = opts.maxAttempts ?? 10;
  const retryDelayMs = opts.retryDelayMs ?? 15_000;

  const chosen =
    typeof option === "string"
      ? info.options.find((o) => o.mode === option)
      : (info.options.find((o) => o.mode === option.mode) ?? option);

  if (!chosen) {
    throw new YouTubeToolkitError(
      `Option "${String(option)}" is not available for this video.`,
    );
  }

  let lastMessage = "The file is still being prepared.";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const json = await postJson<ResolveResponse>(
      (s) => s.routes.resolve,
      {
        video_id: info.videoId,
        download_mode: chosen.mode,
        download_api: info.downloadApi,
        title: info.title,
        ...(chosen.statusUrl ? { status_url: chosen.statusUrl } : {}),
      },
      opts.signal,
    );

    if (!json.success) {
      throw new YouTubeToolkitError(
        json.limit_reached
          ? "Daily free download limit reached on youtubetoolkit.com."
          : json.message || "Could not generate a direct download link.",
        Boolean(json.limit_reached),
      );
    }

    const d = json.data ?? {};

    if (d.download_url && d.status !== "preparing") {
      return {
        downloadUrl: d.download_url,
        fileName: d.file_name ?? `youtube-${info.videoId}`,
        type: d.mode_type ?? chosen.kind,
        quality: d.mode_quality ?? chosen.quality,
        provider: d.provider ?? info.provider,
      };
    }

    lastMessage = d.message ?? lastMessage;
    if (attempt < maxAttempts) await sleep(retryDelayMs);
  }

  throw new YouTubeToolkitError(
    `Timed out waiting for the download link. ${lastMessage}`.trim(),
  );
}
