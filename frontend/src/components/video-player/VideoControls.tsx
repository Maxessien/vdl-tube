import { RootState } from '@/src/store';
import { AnimatePresence, motion } from "framer-motion";
import { RefObject, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import {
  MdForward10,
  MdFullscreen,
  MdFullscreenExit,
  MdReplay10,
  MdVolumeUp,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { VideoState } from "./VideoPlayer";
import VolumeControls from "./VolumeControls";

const VideoControls = ({
  seek,
  videoState,
  videoRef,
}: {
  seek: (amount: number, direction: "forward" | "backward") => void;
  videoState: VideoState;
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  const [editVolume, setEditVolume] = useState(false);

  const {width} = useSelector((state: RootState) => state.screenSize)
  return (
    <div className="flex w-full max-w-5xl mx-auto justify-between items-center">
      <div className="flex-1 flex justify-start relative">
        <button onClick={()=>setEditVolume(!editVolume)} className="inline-flex w-max justify-center items-center hover:bg-(--main-secondary-light) rounded-full p-0.5 sm:p-1 font-medium text-(--text-primary)">
          <MdVolumeUp size={width > 480 ? 25 : 18} />
        </button>
        <AnimatePresence>
          {
           editVolume && <motion.div
              initial={{ y: "25%", opacity: 0.6 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "50%", opacity: 0.3 }}
              transition={{ duration: 0.5, ease: "linear" }}
              className="w-full px-2 py-2 sm:py-3 rounded-md bg-(--main-secondary) absolute bottom-full right-0"
            >
              <VolumeControls videoRef={videoRef} videoState={videoState} />
            </motion.div>
          }
        </AnimatePresence>
      </div>
      <div className="flex flex-1 justify-center items-center gap-1 sm:gap-2">
        <button
          className="inline-flex justify-center items-center hover:bg-(--main-secondary-light) rounded-full p-0.5 sm:p-1 font-medium text-(--text-primary)"
          onClick={() => seek(-10, "backward")}
        >
          <MdReplay10 size={width < 480 ? 22 : 27} />
        </button>
        <button
          style={width < 480 ? {padding: "10px"} : {}}
          className="inline-flex justify-center items-center p-3 sm:p-4 text-lg rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-medium text-(--text-primary)"
          onClick={() =>
            videoState.paused
              ? videoRef?.current?.play()
              : videoRef?.current?.pause()
          }
          disabled={videoState.loading}
        >
          {videoState.paused ? <FaPlay /> : <FaPause />}
        </button>
        <button
          className="inline-flex justify-center items-center hover:bg-(--main-secondary-light) rounded-full p-0.5 sm:p-1 font-medium text-(--text-primary)"
          onClick={() => seek(10, "forward")}
        >
          <MdForward10 size={width < 480 ? 22 : 27} />
        </button>
      </div>
      <div className="flex-1 flex gap-2 justify-end">
        <button
          className="inline-flex w-max justify-start items-center hover:bg-(--main-secondary-light) rounded-full p-0.5 sm:p-1 font-medium text-(--text-primary)"
          onClick={() =>
            videoState.expanded
              ? document.exitFullscreen()
              : videoRef?.current?.parentElement?.requestFullscreen()
          }
        >
          {videoState.expanded ? (
            <MdFullscreenExit size={width < 480 ? 22 : 27} className="sm:w-7 sm:h-7" />
          ) : (
            <MdFullscreen size={width < 480 ? 22 : 27} className="sm:w-7 sm:h-7" />
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoControls;
