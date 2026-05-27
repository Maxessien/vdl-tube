"use client"

import useSearch from "@/src/hooks/useSearch";
import { PlaylistVideo } from "@/src/types/matesTypes";
import { secondsToTimestamp } from "@/src/utils/downloader";
import { FaDownload, FaSpinner } from "react-icons/fa";

const PlaylistVideoCard = ({ videoInfo }: { videoInfo: PlaylistVideo }) => {
  const { duration, thumbnails, title, videoId } = videoInfo;

  const { search, isFetching } = useSearch();

  return (
    <div>
      <div>
        <picture>
          {thumbnails.map(({ url }) => (
            <source srcSet={url} key={url} />
          ))}
          <img
            src={thumbnails.reduce((a, b) => (a.width > b.width ? a : b)).url}
            alt="Video Thumbnail"
          />
        </picture>
        <p>
          <span>
            {duration.text ||
              secondsToTimestamp(duration.seconds, duration.seconds < 3599)}
          </span>
        </p>
      </div>
      <div>
        <p>{title}</p>
        <button
          disabled={isFetching}
          onClick={() => search(`https://www.youtube.com/watch?v=${videoId}`)}
        >
          {isFetching ? <FaSpinner className="animate-spin" /> : <FaDownload />}
        </button>
      </div>
    </div>
  );
};

export default PlaylistVideoCard;
