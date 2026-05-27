"use client"

import useSearch from "@/src/hooks/useSearch";
import { PlaylistVideo } from "@/src/types/matesTypes";
import { secondsToTimestamp } from "@/src/utils/downloader";
import { FaDownload, FaSpinner } from "react-icons/fa";

const PlaylistVideoCard = ({ videoInfo }: { videoInfo: PlaylistVideo }) => {
  const { duration, thumbnails, title, videoId } = videoInfo;
  const { search, isFetching } = useSearch();

  return (
    <div className="group flex items-center gap-4 p-2 rounded-xl hover:bg-(--main-secondary-light)/60 transition-colors border border-transparent hover:border-white/5">
      {/* Video Preview Image Block */}
      <div className="relative w-40 sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0 bg-(--main-secondary-light) shadow-sm">
        <picture>
          {thumbnails.map(({ url }) => (
            <source srcSet={url} key={url} />
          ))}
          <img
            src={thumbnails.reduce((a, b) => (a.width > b.width ? a : b)).url}
            alt="Video Thumbnail"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </picture>
        
        {/* Floating Duration Micro-badge */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-wide text-white">
          {duration.text || secondsToTimestamp(duration.seconds, duration.seconds < 3599)}
        </div>
      </div>

      {/* Meta Contents and Operational Buttons */}
      <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
        <div className="min-w-0 pt-1">
          <h3 className="font-semibold text-sm sm:text-base leading-snug text-(--text-primary) line-clamp-2 group-hover:text-white transition-colors">
            {title}
          </h3>
        </div>

        {/* Floating Actions Panel */}
        <div className="flex items-center shrink-0 pt-1">
          <button
            disabled={isFetching}
            onClick={() => search(`https://www.youtube.com/watch?v=${videoId}`)}
            className="p-3 rounded-full text-(--text-primary-light) hover:text-white bg-transparent hover:bg-white/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            title="Download video"
          >
            {isFetching ? (
              <FaSpinner className="animate-spin text-sm" />
            ) : (
              <FaDownload className="text-sm" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistVideoCard;
