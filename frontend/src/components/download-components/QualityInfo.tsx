import type { VideoInfo } from "@/src/types/matesTypes";
import { YtdlpFormatsRes } from "@/src/types/ytdlpTypes";
import {
  downloadFile,
  getYouTubeID,
  ytdlpDownload,
} from "@/src/utils/downloader";
import logger from "@/src/utils/logger";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Chapter } from "get-youtube-chapters";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import Chapters from "./Chapters";

interface QualityInfo {
  info: VideoInfo;
  ytdlpFormats: YtdlpFormatsRes | null;
  quality: number;
  closeInfoFn: () => void;
  formatType: "audio" | "video";
}

const formatTime = (totalSeconds: number | null) => {
  if (totalSeconds === null) return "00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const QualityInfo = ({
  info,
  closeInfoFn,
  quality,
  formatType,
  ytdlpFormats,
}: QualityInfo) => {
  const { key, duration, title, titleSlug, url, id } = info;

  const [downloading, setDownloading] = useState<{
    isActive: boolean;
    type: string;
    prog: number;
    start: null | number;
    end: number | null;
    isProcessing: boolean;
  }>({
    isActive: false,
    type: "",
    prog: 0,
    start: null,
    end: null,
    isProcessing: false,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      start,
      end,
      title,
      type,
    }: {
      type: string;
      start?: number;
      title: string;
      end?: number;
    }) => {
      setDownloading({
        isActive: true,
        type: type,
        prog: 0,
        end,
        start,
        isProcessing: false,
      });

      if (start || end)
        toast.warn("Range downloads takes more time to process video/audio");

      if (type.trim().startsWith("chapter"))
        toast.warn(
          "Chapter downloads takes more time to process and trim video/audio",
        );

      console.log(ytdlpFormats);

      if (ytdlpFormats) {
        return ytdlpDownload(
          title,
          ytdlpFormats.format_id,
          id,
          url,
          formatType,
          ytdlpFormats.ext,
          quality,
          ({ isActive, prog }) =>
            setDownloading((st) => ({
              ...st,
              prog: prog,
              isProcessing: isActive,
            })),
          start,
          end,
        );
      } else {
        return downloadFile(
          key,
          quality,
          titleSlug,
          title,
          formatType,
          start ?? undefined,
          end ?? undefined,
        );
      }
    },
    onSuccess: () =>
      toast.success(
        (formatType === "audio" ? "Audio" : "Video") + " download started",
      ),
    onError: () =>
      toast.error(
        (formatType === "audio" ? "Audio" : "Video") + " download failed",
      ),
    onSettled: () => setDownloading((state) => ({ ...state, isActive: false, isProcessing: false })),
  });

  const [enableTrim, setEnableTrim] = useState(false);
  const [range, setRange] = useState<{
    rangeStart: null | number;
    rangeEnd: null | number;
  }>({ rangeStart: null, rangeEnd: null });

  const handleToggleTrim = (checked: boolean) => {
    setEnableTrim(checked);
    if (checked) {
      setRange({ rangeStart: 0, rangeEnd: duration });
    } else {
      setRange({ rangeStart: null, rangeEnd: null });
    }
  };

  const [chaps, setChaps] = useState<{ isLoading: boolean; data: Chapter[] }>({
    isLoading: false,
    data: [],
  });

  const getChapters = async () => {
    const vidId = info?.id ?? getYouTubeID(url);
    const chapters = await axios.get<{ title: string; start: number }[]>(
      "/api/chapter",
      { params: { id: vidId } },
    );
    return chapters.data;
  };

  useEffect(() => {
    (async () => {
      setChaps((state) => ({ ...state, isLoading: true }));
      try {
        const chapters = await getChapters();
        if (!chapters) throw new Error("No chapters for this video");
        setChaps({
          isLoading: false,
          data: chapters?.map(({ title, start }) => ({
            start,
            title,
          })),
        });
      } catch (err) {
        logger.log("Chapter fetch error", err);
        setChaps({ isLoading: false, data: [] });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className="mb-6">
        <button
          onClick={closeInfoFn}
          className="text-base font-medium gap-2 mb-6 text-(--text-primary) flex justify-start items-center hover:opacity-80 transition-opacity"
        >
          <FaArrowLeft /> Go back
        </button>

        {/* Range Trim Section */}
        <div className="mb-6">
          <label className="flex items-center gap-3 text-(--text-primary) font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={enableTrim}
              onChange={(e) => handleToggleTrim(e.target.checked)}
              disabled={isPending || downloading.isActive}
              className="w-4 h-4 accent-(--main-primary) rounded"
            />
            Enable Range Trim
          </label>

          {enableTrim && (
            <div className="flex flex-col gap-5 mt-4 p-4 bg-(--main-secondary-light) rounded-lg shadow-inner">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-(--text-primary) flex justify-between font-semibold">
                  <span>Start Time</span>
                  <span>{formatTime(range.rangeStart)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={range.rangeStart ?? 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRange((prev) => ({
                      ...prev,
                      rangeStart: Math.min(
                        val,
                        (prev.rangeEnd ?? duration) - 1,
                      ),
                    }));
                  }}
                  disabled={isPending || downloading.isActive}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-(--main-primary) bg-gray-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-(--text-primary) flex justify-between font-semibold">
                  <span>End Time</span>
                  <span>{formatTime(range.rangeEnd ?? duration)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={range.rangeEnd ?? duration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRange((prev) => ({
                      ...prev,
                      rangeEnd: Math.max(val, (prev.rangeStart ?? 0) + 1),
                    }));
                  }}
                  disabled={isPending || downloading.isActive}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-(--main-primary) bg-gray-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="relative rounded-full">
          {downloading.isProcessing && (
            <div
              style={{ width: `${downloading.prog}%` }}
              className="bg-(--main-primary-light) opacity-85 absolute top-0 left-0 h-full rounded-full"
            ></div>
          )}
          <button
            onClick={() =>
              mutateAsync({
                type: "full",
                title,
                end: enableTrim ? (range.rangeEnd ?? undefined) : undefined,
                start: enableTrim ? (range.rangeStart ?? undefined) : undefined,
              })
            }
            disabled={
              isPending || (downloading.isActive && downloading.type === "full")
            }
            className="flex disabled:opacity-75 py-3 px-4 w-full justify-center items-center text-xl text-(--text-primary) rounded-full bg-(--main-primary) font-semibold transition-transform active:scale-[0.98]"
          >
            {downloading.isActive && downloading.type === "full" ? (
              <>
                <span className="sr-only">
                  Downloading {formatType === "audio" ? "Audio" : "Video"}
                </span>
                <FaSpinner className="text-3xl animate-spin" />
              </>
            ) : (
              "Download " + (formatType === "audio" ? "Audio" : "Video")
            )}
          </button>
        </div>
      </section>

      <Chapters
        isActive={(type) => downloading.isActive && downloading.type === type}
        isPending={isPending}
        chapters={chaps}
        downloadFn={(type, start, title, end) =>
          mutateAsync({ type, start, end, title })
        }
      />
    </>
  );
};

export default QualityInfo;
