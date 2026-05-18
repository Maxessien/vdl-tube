import { AnimatePresence, motion } from "framer-motion";
import { MouseEvent, RefObject, useRef } from "react";
import LoadRoller from "../reusable-components/LoadRoller";
import { VideoState } from "./VideoPlayer";

const SeekOverlay = ({ amount }: { amount: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.3 }}
      transition={{ duration: 0.5, ease: "linear" }}
      className="w-full h-full flex justify-center items-center select-none bg-[rgb(0,0,0,0.6)] text-base lg:text-xl font-medium text-(--text-primary)"
    >
      {amount}
    </motion.div>
  );
};

const VideoClickRegister = ({
  vidRef,
  showControlsFn,
  seekFn,
  isPaused,
  videoState
}: {
  vidRef: RefObject<HTMLVideoElement>;
  showControlsFn: () => void;
  seekFn: (amount: number, diretion: "forward" | "backward") => void;
  isPaused: boolean;
  videoState: VideoState;
}) => {
  const clickTimeOut = useRef<NodeJS.Timeout[]>([]);
  const seekeDoubleClick = (
    amount: number,
    e: MouseEvent<HTMLDivElement>,
    direction: "forward" | "backward",
  ) => {
    e.stopPropagation();
    clickTimeOut.current.forEach((timeOut) => clearTimeout(timeOut));
    seekFn(amount, direction);
  };

  return (
    <div
      onClick={() => {
        const timeOut = setTimeout(showControlsFn, 300);
        clickTimeOut.current.push(timeOut);
      }}
      className="w-full h-full grid grid-cols-3"
    >
      <div
        onDoubleClick={(e) => seekeDoubleClick(-10, e, "backward")}
        className="w-full h-full"
      >
        <AnimatePresence>
          {videoState.seeked.active && videoState.seeked.direction === "backward" && (
            <SeekOverlay amount="-10 sec" />
          )}
        </AnimatePresence>
      </div>
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          clickTimeOut.current.forEach((timeOut) => clearTimeout(timeOut));
          isPaused ? vidRef?.current?.play() : vidRef?.current?.pause();
        }}
        className="w-full h-full flex items-center justify-center"
      >
        {videoState.loading && <div className="bg-[rgb(0,0,0,0.6)] w-20 h-20 rounded-full p-3">
            <LoadRoller strokeWidth={10} />
          </div>}
      </div>
      <div
        onDoubleClick={(e) => seekeDoubleClick(10, e, "forward")}
        className="w-full h-full"
      >
        <AnimatePresence>
          {videoState.seeked.active && videoState.seeked.direction === "forward" && (
            <SeekOverlay amount="10 sec" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoClickRegister;
