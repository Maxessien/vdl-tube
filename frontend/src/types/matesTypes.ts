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

export interface SearchResult {
  title: string;
  video_id: string;
  thumbnails: string[];
  duration: {
    text: string | undefined;
    seconds: number;
  };
  view_count: string;
}
