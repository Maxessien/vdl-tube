import { getUserHomeFeed } from "@/src/utils/youtubei";
import { YTNodes } from "youtubei.js";

export interface AudioFormat {
  quality: number;
  label: string;
  url: string | null;
}

export interface VideoFormat {
  height: number;
  width: number;
  quality: number;
  label: string;
  url: string | null;
  default_selected: 0 | 1;
}

export interface ThumbnailFormat {
  label: string;
  quality: string;
  value: string;
  url: string;
}

export interface VideoInfo {
  id: string;
  key: string;
  url: string;
  title: string;
  titleSlug: string;
  thumbnail: string;
  duration: number;
  durationLabel: string;
  audio_formats: AudioFormat[];
  video_formats: VideoFormat[];
  thumbnail_formats: ThumbnailFormat[];
  default_selected: number;
  fromCache: boolean;
}

export type ContentType = "video" | "audio" | "all";

export interface DownloadUrlResult {
  status: boolean;
  message: string;
  data: { downloadUrl: string } | null;
}

export type SearchResultVideos = YTNodes.Video | YTNodes.CompactVideo;
export type SearchResultPlaylist = YTNodes.Playlist | YTNodes.GridPlaylist;

// Serializable versions for Server to Client Component passing
export interface SerializedVideoResult {
  video_id: string;
  title: string;
  view_count: string;
  best_thumbnail: { url: string };
  thumbnails: { url: string }[];
  author: { name: string; best_thumbnail: { url: string } };
  duration: { text: string | undefined; seconds: number };
}

export interface SerializedPlaylistResult {
  id: string;
  author: string;
  authorThumbnail?: string;
  thumbnails: Array<{ url: string; width?: number }>;
}

export interface Thumbnails {
  url: string;
  width: number;
  height: number;
}

export type UserHomeFeed = Awaited<ReturnType<typeof getUserHomeFeed>>;

export interface PlaylistInfo {
  subtitle: string | null;
  author: { thumbnails: Thumbnails[]; name: string };
  thumbnails: Thumbnails[];
  total_items: string;
  views: string;
  last_updated: string;
  title?: string | undefined;
  description?: string | undefined;
  type?: string | undefined;
}

export interface PlaylistVideo {
  videoId: string;
  thumbnails: Thumbnails[];
  duration: { text: string | undefined; seconds: number };
  title: string
}
