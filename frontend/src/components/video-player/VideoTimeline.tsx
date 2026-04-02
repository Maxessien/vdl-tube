import { secondsToTimestamp } from "@/src/utils/downloader";
import { RefObject } from "react";
import { VideoState } from "./VideoPlayer";

const VideoTimeline = ({
  videoRef,
  videoState,
}: {
  videoState: VideoState;
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  const getWatchedPercent = (current: number, total: number) => {
    if (total <= 0) return 0;
    return (current / total) * 100;
  };

  const handleSeekTouch = (location: number, rect: DOMRect) => {
    const ratio = (location - rect.left) / rect.width;
    const time = videoRef?.current?.duration * ratio;
    videoRef.current.currentTime = time;
  };

  return (
    <div className="flex w-full gap-3 justify-between items-center">
      <span className="text-sm font-medium text-(--text-primary)">
        {secondsToTimestamp(
          videoState.currentTime,
          videoRef?.current?.duration < 60 * 60,
        )}
      </span>
      <span
        className={`flex-1 h-2 relative rounded-full`}
        onTouchEnd={(e) =>
          handleSeekTouch(
            e.changedTouches?.[0].clientX,
            e?.currentTarget?.getBoundingClientRect(),
          )
        }
        onClick={(e) =>
          handleSeekTouch(e.clientX, e?.currentTarget?.getBoundingClientRect())
        }
        style={{
          display: "grid",
          gridTemplateColumns: `${getWatchedPercent(videoState.currentTime, videoRef?.current?.duration)}% 
                ${100 - getWatchedPercent(videoState.currentTime, videoRef?.current?.duration)}%`,
        }}
      >
        <span className="h-full w-full rounded-full bg-(--main-primary-light)"></span>
        <span className="h-full w-full rounded-full bg-(--text-primary-light)"></span>
        <span
          style={{
            left: `${getWatchedPercent(videoState.currentTime, videoRef?.current?.duration)}%`,
          }}
          className="absolute top-1/2 -translate-1/2 bg-(--main-primary) h-3 w-3 rounded-full"
        ></span>
      </span>
      <span className="text-sm font-medium text-(--text-primary)">
        {secondsToTimestamp(
          videoRef?.current?.duration,
          videoRef?.current?.duration < 60 * 60,
        )}
      </span>
    </div>
  );
};

export default VideoTimeline;
