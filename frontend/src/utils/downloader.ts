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
  const ext = type === "audio" ? "mp3" : "mp4"
  link.href = `/api/download?url=${data.downloadUrl}${hasStart ? `&start=${start}&type=${type}` : ""}${hasStart && hasEnd && Number(start) < Number(end) ? `&end=${end}` : ""}`;
  const downloadFilename = title && quality ? `${title}-${quality}${type==="audio" ? "K" : "P"}.${ext}` : `${v4()}.${ext}`
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

export const secondsToTimestamp = (seconds: number, omitHours: boolean = false): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  const timeArr = omitHours ? [minutes, remainingSeconds] : [hours, minutes, remainingSeconds]

  return timeArr
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
};