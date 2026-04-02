"use client";

import { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import VideoClickRegister from "./VideoClickRegister";
import VideoControls from "./VideoControls";
import VideoTimeline from "./VideoTimeline";


export interface VideoState {
    paused: boolean;
    playbackStarted: boolean;
    currentTime: number;
}

const VideoPlayer = ({
  url,
  posterUrl,
  title,
}: {
  url: string;
  posterUrl: string;
  title: string;
}) => {
  const [showControls, setShowControls] = useState(true);
  const [videoState, setVideoState] = useState({
    paused: true,
    playbackStarted: false,
    currentTime: 0,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const seek = (seekAmount: number) => {
    videoRef.current.currentTime = videoRef.current.currentTime + seekAmount;
  };


  return (
    <div className="w-full relative">
      <video
        ref={videoRef}
        className="w-full z-5"
        src={url}
        preload="metadata"
        poster={posterUrl}
        onPlay={() =>
          setVideoState((state) => ({
            ...state,
            paused: false,
            playbackStarted: true,
          }))
        }
        onPause={() => setVideoState((state) => ({ ...state, paused: true }))}
        onTimeUpdate={(e) => {
          const time = e?.currentTarget?.currentTime;
          setVideoState((state) => ({
            ...state,
            currentTime: Number.isFinite(time) ? time : 0,
          }));
        }}
        onEnded={() =>
          setVideoState({
            paused: true,
            playbackStarted: false,
            currentTime: 0,
          })
        }
      ></video>
      {showControls && (
        <div className="absolute z-10 w-full flex flex-col h-full top-0 left-0">
          <div className="w-full px-2 py-3 bg-[rgb(0,0,0,0.55)]">
            <p className="text-base text-left font-medium text-(--text-primary)">
              {title}
            </p>
          </div>
          <div className="flex-1">
            <VideoClickRegister
              vidRef={videoRef}
              showControlsFn={() => setShowControls(false)}
              seekFn={seek}
              isPaused={videoState.paused}
            />
          </div>
          <div className="bg-[rgb(0,0,0,0.55)] px-3 py-2">
            <VideoTimeline videoRef={videoRef} videoState={videoState} />
            <VideoControls seek={seek} videoRef={videoRef} videoState={videoState} />
          </div>
        </div>
      )}

      {!showControls && videoState.playbackStarted && (
        <div className="absolute z-15 top-0 left-0 h-full w-full">
          <VideoClickRegister
            vidRef={videoRef}
            showControlsFn={() => setShowControls(true)}
            seekFn={seek}
            isPaused={videoState.paused}
          />
        </div>
      )}

      {!videoState.playbackStarted && (
        <div className="absolute z-15 w-full flex items-center justify-center h-full top-0 left-0 bg-(--main-secondary-light)">
          <button
            onClick={() => {
              console.log(videoRef?.current);
              videoRef?.current?.play();
            }}
            className="inline-flex justify-center items-center p-4 text-2xl rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-medium text-(--text-primary)"
          >
            <FaPlay />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
