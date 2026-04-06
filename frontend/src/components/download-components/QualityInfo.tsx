import LoadRoller from "@/src/components/reusable-components/LoadRoller";
import type { VideoInfo } from "@/src/types/matesTypes";
import { downloadVideo, getYouTubeID } from "@/src/utils/downloader";
import logger from "@/src/utils/logger";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Chapter } from "get-youtube-chapters";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import Chapters from "./Chapters";
import RangeDownload from "./RangeDownload";
import { getVideoChapters } from "@/src/utils/youtubei";

interface QualityInfo {
  info: VideoInfo;
  quality: number;
  closeInfoFn: () => void;
}

const QualityInfo = ({ info, closeInfoFn, quality }: QualityInfo) => {
  const { key, duration, title, titleSlug, url } = info;
  const [downloading, setDownloading] = useState({ isActive: true, type: "" });
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
      setDownloading({ isActive: true, type: type });
      if (type === "range")
        toast.warn("Range downloads takes more time to process videos");
      if (type.trim().startsWith("chapter"))
        toast.warn(
          "Chapter downloads takes more time to process and trim videos",
        );
      return downloadVideo(
        key,
        quality,
        titleSlug,
        title,
        start ?? undefined,
        end ?? undefined,
      );
    },
    onSuccess: () => toast.success("Video download started"),
    onError: () => toast.error("Video download failed"),
    onSettled: () => setDownloading((state) => ({ ...state, isActive: false })),
  });

  const [chaps, setChaps] = useState<{ isLoading: boolean; data: Chapter[] }>({
    isLoading: false,
    data: [],
  });

  const getChapters = async () => {
    const vidId = info?.id ?? getYouTubeID(url);
    const chapters = await axios.get<{title: string, start: number}[]>("/api/chapter", {params: {id: vidId}});
    return chapters.data;
  };

  useEffect(() => {
    (async () => {
      setChaps((state) => ({ ...state, isLoading: true }));
      try {
        const chapters = await getChapters();
        if (!chapters) throw new Error("No chapters for this video")
        setChaps({
          isLoading: false,
          data: chapters?.map(({ title, start }) => ({
            start,
            title,
          })),
        });
      } catch (err) {
        logger.log("Chapter fetch error", err);
        setChaps({isLoading: false, data: []})
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section>
        <button
          onClick={closeInfoFn}
          className="text-base font-medium gap-2 mb-4 text-(--text-primary) flex justify-start items-center"
        >
          <FaArrowLeft /> Go back
        </button>
        <button
          onClick={() => mutateAsync({ type: "full", title })}
          disabled={
            isPending || (downloading.isActive && downloading.type === "full")
          }
          className="flex disabled:opacity-75 py-3 px-4 w-full justify-center items-center text-xl text-(--text-primary) not-visited:rounded-full bg-(--main-primary) font-semibold"
        >
          {downloading.isActive && downloading.type === "full" ? (
            <>
              <span className="sr-only">Downloading full video</span>
              <LoadRoller size={24} duration={0.7} />
            </>
          ) : (
            "Download Full Video"
          )}
        </button>
      </section>

      <RangeDownload
        isPending={isPending}
        isActive={downloading.isActive && downloading.type === "range"}
        duration={duration}
        submitFn={(start, end) =>
          mutateAsync({ type: "range", start, end, title })
        }
      />

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
