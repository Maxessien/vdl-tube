import { v4 } from "uuid";
import { resolveDownloadUrl } from "./mate";

export const downloadVideo = async (
  vidKey: string,
  quality: number,
  titleSlug: string,
  title: string,
  start?: number,
  end?: number,
) => {
  const downloadUrlRes = await resolveDownloadUrl(
    vidKey,
    `${quality}`,
    "video",
    null,
    titleSlug,
  );
  const { data } = downloadUrlRes;
  const hasStart = Number.isFinite(start);
  const hasEnd = Number.isFinite(end);
  const link = document.createElement("a");
  link.href = `/api/download?url=${data.downloadUrl}${hasStart ? `&start=${start}` : ""}${hasStart && hasEnd && Number(start) < Number(end) ? `&end=${end}` : ""}`;
  const downloadFilename = title && quality ? `${title}-${quality}P.mp4` : `${v4()}.mp4`
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

export const secondsToTimestamp = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
};