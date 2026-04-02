import { RefObject } from "react";

const VideoClickRegister = ({
  vidRef,
  showControlsFn,
  seekFn,
  isPaused,
}: {
  vidRef: RefObject<HTMLVideoElement>;
  showControlsFn: () => void;
  seekFn: (amount: number) => void;
  isPaused: boolean;
}) => {
  const clickTimeOut: NodeJS.Timeout[] = [];
  return (
    <div
      onClick={() => {
        const timeOut = setTimeout(showControlsFn, 500);
        clickTimeOut.push(timeOut);
      }}
      className="w-full h-full grid grid-cols-3"
    >
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          clickTimeOut.forEach((timeOut) => clearTimeout(timeOut));
          seekFn(-10);
        }}
        className="w-full h-full"
      ></div>
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          clickTimeOut.forEach((timeOut) => clearTimeout(timeOut));
          isPaused ? vidRef?.current?.play() : vidRef?.current?.pause();
        }}
        className="w-full h-full"
      ></div>
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          clickTimeOut.forEach((timeOut) => clearTimeout(timeOut));
          seekFn(10);
        }}
        className="w-full h-full"
      ></div>
    </div>
  );
};

export default VideoClickRegister