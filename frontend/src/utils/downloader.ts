import axios from "axios";
import { v4 } from "uuid";
import { ContentType } from "../types/matesTypes";
import { Task } from "../types/ytdlpTypes";
import { resolveDownloadUrl } from "./mate";

const linkDl = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

const downloadFile = async (
  vidKey: string,
  quality: number,
  titleSlug: string,
  title: string,
  type: "audio" | "video" | "all",
  start?: number,
  end?: number,
) => {
  const downloadUrlRes = await resolveDownloadUrl(
    vidKey,
    `${quality}`,
    type,
    null,
    titleSlug,
  );
  const { data } = downloadUrlRes;
  const hasStart = Number.isFinite(start);
  const hasEnd = Number.isFinite(end);

  const ext = type === "audio" ? "mp3" : "mp4";
  const downloadFilename =
    title && quality
      ? `${title}-${quality}${type === "audio" ? "K" : "P"}.${ext}`
      : `${v4()}.${ext}`;
  const url = `/api/download?url=${encodeURIComponent(data.downloadUrl)}&type=${type}&filename=${encodeURIComponent(downloadFilename)}${hasStart ? `&start=${start}` : ""}${hasStart && hasEnd && Number(start) < Number(end) ? `&end=${end}` : ""}`;

  linkDl(url, downloadFilename);

  return { finished: true };
};

const ytdlpDownload = async (
  title: string,
  formatId: string,
  vidId: string,
  url: string,
  type: "audio" | "video" | "all",
  ext: string,
  quality: number | string,
  setProg: (val: { isActive: boolean; prog: number }) => void,
  start?: number,
  end?: number,
) => {
  const { data } = await axios.post<{ data: string; task_id: string }>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/task`,
    {
      format: formatId,
      vid_id: vidId,
      url,
      end,
      start,
      ext,
      title,
      type,
    },
  );

  const MAX_ATTEMPTS = 450; // 15 minutes at 2s intervals

  await new Promise<void>((res, rej) => {
    let attempts = 0;

    const poll = async () => {
      if (attempts++ >= MAX_ATTEMPTS) {
        rej(new Error("Download timed out"));
        return;
      }

      try {
        const { data: task } = await axios.get<Task>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/status`,
          { params: { task_id: data.task_id } },
        );

        setProg({ isActive: true, prog: task.progress });

        if (task.status === "finished") return res();
        if (task.status === "failed") return rej(new Error("Download failed"));

        setTimeout(poll, 2000);
      } catch (err) {
        rej(err);
      }
    };

    setTimeout(poll, 2000);
  });
  
  const dlUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/download/${data.task_id}`;

  linkDl(dlUrl, `${title}-${quality}${type === "audio" ? "K" : "P"}.${ext}`)
  
  return { finished: true };
};

const getYouTubeID = (url: string): string | null => {
  const regex =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regex);

  if (match && match[1].length === 11) {
    return match[1];
  }

  return null;
};

const timestampToSeconds = (timestamp: string): number => {
  return timestamp
    .split(":")
    .reverse()
    .reduce((total, part, index) => {
      return total + parseInt(part, 10) * Math.pow(60, index);
    }, 0);
};

const secondsToTimestamp = (
  seconds: number,
  omitHours: boolean = false,
): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  const timeArr = omitHours
    ? [minutes, remainingSeconds]
    : [hours, minutes, remainingSeconds];

  return timeArr.map((part) => part.toString().padStart(2, "0")).join(":");
};

const IFRAME_EMBED_URL = "https://invidious.tiekoetter.com/embed";

const checkIframeUrl = async (url: string) => {
  try {
    // A HEAD request is faster because it downloads headers, not the full page body
    const response = await axios.head(url, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    // Fallback to GET if the server blocks HEAD requests
    try {
      const response = await axios.get(url, { timeout: 3000 });
      return response.status === 200;
    } catch (getExtraError) {
      return false; // URL is broken, timed out, or returned 404/500
    }
  }
};

const isYouTubePlaylist = (url: string): boolean => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([^&\s]+)/;
  return regex.test(url);
};

const extractPlaylistId = (url: string): string | null => {
  const regex = /[?&]list=([^&\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const formatFilesize = (size?: number | null) => {
  if (!Number.isFinite(size) || (size as number) <= 0) return "Unknown size";

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let converted = size as number;
  let unitIdx = 0;

  while (converted >= 1024 && unitIdx < units.length - 1) {
    converted /= 1024;
    unitIdx++;
  }

  return `approx. ${converted.toFixed(2)} ${units[unitIdx]}`;
};
const getVidUrl = async (
  quality: string,
  key: string,
  titleSlug: string,
  type: ContentType = "video",
) => {
  try {
    const { data } = await resolveDownloadUrl(
      key,
      quality,
      type,
      null,
      titleSlug,
    );
    if (!data) return null;
    return `/api/download?url=${encodeURIComponent(data.downloadUrl)}&stream=true`;
  } catch (err) {
    return null;
  }
};

export {
  checkIframeUrl,
  downloadFile,
  extractPlaylistId,
  formatFilesize,
  getVidUrl,
  getYouTubeID, IFRAME_EMBED_URL, isYouTubePlaylist, secondsToTimestamp,
  timestampToSeconds, ytdlpDownload
};

