import { existsSync } from "fs";
import path from "path";
import ffmpegPath from "ffmpeg-static";


function resolveFfmpegBinaryPath(): string | null {
  const candidates = [
    ffmpegPath,
    path.join(
      process.cwd(),
      "node_modules",
      "ffmpeg-static",
      process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg",
    ),
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string" || candidate.length === 0) {
      continue;
    }

    const normalizedPath = path.normalize(candidate);
    if (existsSync(normalizedPath)) {
      return normalizedPath;
    }
  }

  return null;
}


function parseTimeParam(value: string | null): number | null {
  if (value == null) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

const YT_COOKIE_NAME = "yt_secure_session"


export {resolveFfmpegBinaryPath, parseTimeParam, YT_COOKIE_NAME}