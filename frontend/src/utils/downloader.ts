import axios from "axios";
import { v4 } from "uuid";
import { resolveDownloadUrl } from "./mate";

export const downloadFile = async (
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
  const link = document.createElement("a");
  const ext = type === "audio" ? "mp3" : "mp4";
  const downloadFilename =
    title && quality
      ? `${title}-${quality}${type === "audio" ? "K" : "P"}.${ext}`
      : `${v4()}.${ext}`;
  link.href = encodeURIComponent(
    `/api/download?url=${data.downloadUrl}&type=${type}&filename=${downloadFilename.replaceAll("&", "_").replaceAll("/", "_")}&${hasStart ? `&start=${start}` : ""}${hasStart && hasEnd && Number(start) < Number(end) ? `&end=${end}` : ""}`,
  );
  link.download = downloadFilename;
  link.click();
  return { finished: true };
};

export const getYouTubeID = (url: string): string | null => {
  const regex =
    /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = url.match(regex);

  if (match && match[1].length === 11) {
    return match[1];
  }

  return null;
};

export const timestampToSeconds = (timestamp: string): number => {
  return timestamp
    .split(":")
    .reverse()
    .reduce((total, part, index) => {
      return total + parseInt(part, 10) * Math.pow(60, index);
    }, 0);
};

export const secondsToTimestamp = (
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

export const IFRAME_EMBED_URL = "https://invidious.tiekoetter.com/embed";

export const checkIframeUrl = async (url: string) => {
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

export const isYouTubePlaylist = (url: string): boolean => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([^&\s]+)/;
  return regex.test(url);
};

export const extractPlaylistId = (url: string): string | null => {
  const regex = /[?&]list=([^&\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
