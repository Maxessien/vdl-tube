/* eslint-disable react-hooks/refs */
import { secondsToTimestamp } from "@/src/utils/downloader";
import { RefObject, useState } from "react";
import { VideoState } from "./VideoPlayer";

const VideoTimeline = ({
  videoRef,
  videoState,
}: {
  videoState: VideoState;
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
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
    <div className="flex w-full leading-px gap-2 sm:gap-3 justify-between items-center">
      <span className="text-[11px] sm:text-sm font-medium text-(--text-primary)">
        {secondsToTimestamp(
          videoState.currentTime ?? 0,
          (videoRef?.current?.duration ?? 0) < 60 * 60,
        )}
      </span>
      <div
        className={`flex-1 h-1.5 sm:h-2 relative rounded-full`}
        onTouchMove={(e) =>
          handleSeekTouch(
            e.changedTouches?.[0]?.clientX,
            e?.currentTarget?.getBoundingClientRect(),
          )
        }
        onPointerMove={(e) => {
          if (!isSeeking) return;
          handleSeekTouch(e.clientX, e?.currentTarget?.getBoundingClientRect());
        }}
        onPointerDown={() => setIsSeeking(true)}
        onPointerUp={() => setIsSeeking(false)}
        onClick={(e)=>{
          handleSeekTouch(e.clientX, e?.currentTarget?.getBoundingClientRect());
          setIsSeeking(false)
        }}
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
          className="absolute cursor-pointer top-1/2 -translate-1/2 bg-(--main-primary) h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full"
        ></span>
      </div>
      <span className="text-[11px] sm:text-sm font-medium text-(--text-primary)">
        {secondsToTimestamp(
          videoRef?.current?.duration ?? 0,
          (videoRef?.current?.duration ?? 0) < 60 * 60,
        )}
      </span>
    </div>
  );
};

export default VideoTimeline;
