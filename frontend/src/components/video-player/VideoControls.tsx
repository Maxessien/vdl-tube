import { RefObject, useEffect, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import {
    MdForward10,
    MdFullscreen,
    MdFullscreenExit,
    MdReplay10,
} from "react-icons/md";
import { VideoState } from "./VideoPlayer";

const VideoControls = ({
  seek,
  videoState,
  videoRef,
}: {
  seek: (amount: number) => void;
  videoState: VideoState;
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleFullScrChange = () => {
      if (document.fullscreenElement) setExpanded(true);
      else setExpanded(false);
    };

    document.addEventListener("fullscreenchange", ()=>{
        handleFullScrChange()
    });

    const removeAllListeners = () => {
      document.removeEventListener("fullscreenchange", ()=>{
        handleFullScrChange()
    });
    };

    return removeAllListeners();
  }, []);

  return (
    <div className="grid grid-cols-3 justify-between items-center">
      <button className="w-full h-full"></button>
      <div className="flex w-full justify-center items-center gap-2">
        <button
          className="inline-flex justify-center items-center hover:bg-(--main-secondary-light) rounded-full p-1 font-medium text-(--text-primary)"
          onClick={() => seek(-10)}
        >
          <MdReplay10 size={28} />
        </button>
        <button
          className="inline-flex justify-center items-center p-4 text-lg rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-medium text-(--text-primary)"
          onClick={() =>
            videoState.paused
              ? videoRef?.current?.play()
              : videoRef?.current?.pause()
          }
        >
          {videoState.paused ? <FaPlay /> : <FaPause />}
        </button>
        <button
          className="inline-flex justify-center items-center hover:bg-(--main-secondary-light) rounded-full p-1 font-medium text-(--text-primary)"
          onClick={() => seek(10)}
        >
          <MdForward10 size={28} />
        </button>
      </div>
      <button
        className="inline-flex w-max justify-center items-center hover:bg-(--main-secondary-light) rounded-full p-1 font-medium text-(--text-primary)"
        onClick={() =>
          expanded
            ? document.exitFullscreen()
            : videoRef?.current?.parentElement?.requestFullscreen()
        }
      >
        {expanded ? <MdFullscreenExit size={28} /> : <MdFullscreen size={28} />}
      </button>
    </div>
  );
};

export default VideoControls;
