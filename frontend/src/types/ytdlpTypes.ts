export interface YtdlpFormatsRes {
  ext: string;
  filesize: number;
  filesize_approx: number;
  format_id: string;
  quality: number;
  url: string;
}

export interface Task {
  vid_id: string;
  status: string;
  url: string;
  progess: number;
  format: string | number | null;
  path: string | null;
  start: number | null;
  end: number | null;
  task_id: string;
}
