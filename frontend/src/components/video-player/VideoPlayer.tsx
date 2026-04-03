"use client";

import { AnimatePresence, motion } from "framer-motion";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import VideoClickRegister from "./VideoClickRegister";
import VideoControls from "./VideoControls";
import VideoTimeline from "./VideoTimeline";

export interface VideoState {
  paused: boolean;
  playbackStarted: boolean;
  currentTime: number;
  loading: boolean;
  seeked: { direction: "forward" | "backward"; active: boolean };
  expanded: boolean;
  muted: boolean;
}

const VideoPlayer = ({
  urls,
  posterUrl,
  title,
  startTime,
}: {
  urls: string[];
  posterUrl: string;
  title: string;
  startTime?: number;
}) => {
  const [showControls, setShowControls] = useState(true);
  const [videoState, setVideoState] = useState<VideoState>({
    paused: true,
    playbackStarted: false,
    currentTime: 0,
    loading: false,
    seeked: { direction: "forward", active: false },
    expanded: false,
    muted: false,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const seek = (seekAmount: number, direction: "forward" | "backward") => {
    setVideoState((state) => ({
      ...state,
      seeked: { direction, active: true },
    }));
    videoRef.current.currentTime = videoRef.current.currentTime + seekAmount;
    setTimeout(
      () =>
        setVideoState((state) => ({
          ...state,
          seeked: { direction, active: false },
        })),
      500,
    );
  };

  useEffect(() => {
    const handleFullScrChange = () => {
      if (document.fullscreenElement)
        setVideoState((state) => ({ ...state, expanded: true }));
      else setVideoState((state) => ({ ...state, expanded: false }));
    };

    document.addEventListener("fullscreenchange", () => {
      handleFullScrChange();
    });

    const removeAllListeners = () => {
      document.removeEventListener("fullscreenchange", () => {
        handleFullScrChange();
      });
    };

    return removeAllListeners();
  }, []);

  const handleKeyEvent = ({ key }: KeyboardEvent<HTMLDivElement>) => {
    const vidRef = videoRef?.current;
    if (!vidRef) return;

    switch (key) {
      case " ":
        videoState.paused
          ? videoRef?.current?.play()
          : videoRef?.current?.pause();
        break;
      case "ArrowUp":
        if (vidRef.volume < 0.95) vidRef.volume += 0.05;
        break;
      case "ArrowDown":
        if (vidRef.volume > 0.05) vidRef.volume -= 0.05;
        break;
      case "ArrowRight":
        seek(10, "forward");
        break;
      case "ArrowLeft":
        seek(-10, "backward");
        break;
      default:
        break;
    }
  };

  return (
    <div
      tabIndex={1}
      onKeyDown={(e) => {
        if (videoState.expanded) handleKeyEvent(e);
      }}
      className="h-full w-max max-w-full relative focus:outline-0"
    >
      <video
        ref={videoRef}
        className="h-full z-5"
        preload="metadata"
        poster={posterUrl}
        onLoadedMetadata={(e) => {
          if (!startTime) return;
          e.currentTarget.currentTime = startTime;
        }}
        onPlay={() => {
          setVideoState((state) => ({
            ...state,
            paused: false,
            playbackStarted: true,
          }));
        }}
        onPause={() => setVideoState((state) => ({ ...state, paused: true }))}
        onTimeUpdate={(e) => {
          const time = e?.currentTarget?.currentTime;
          setVideoState((state) => ({
            ...state,
            currentTime: Number.isFinite(time) ? time : 0,
          }));
        }}
        onLoadStart={() => {
          setVideoState((state) => ({ ...state, loading: true }));
        }}
        onCanPlay={() => {
          setVideoState((state) => ({ ...state, loading: false }));
        }}
        onEnded={() =>
          setVideoState((state) => ({
            ...state,
            paused: true,
            playbackStarted: false,
            currentTime: 0,
            loading: false,
            seeked: { direction: "forward", active: false },
          }))
        }
        onVolumeChange={(e) => {
          const bool = e?.currentTarget?.muted || false;
          setVideoState((state) => ({ ...state, muted: bool }));
        }}
      >
        {urls.map((url) => (
          <source src={url} type="video/mp4"></source>
        ))}
      </video>
      <AnimatePresence>
        {videoState.playbackStarted && showControls && (
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.15, ease: "linear" }}
            className="absolute z-10 w-full flex flex-col h-full top-0 left-0"
          >
            <div className="w-full px-2 py-3 bg-[rgb(0,0,0,0.55)]">
              <p className="text-base text-left font-medium text-(--text-primary)">
                {title}
              </p>
            </div>
            <div className="flex-1">
              <VideoClickRegister
                videoState={videoState}
                vidRef={videoRef}
                showControlsFn={() => setShowControls(false)}
                seekFn={seek}
                isPaused={videoState.paused}
              />
            </div>
            <div className="bg-[rgb(0,0,0,0.55)] px-3 py-2 flex flex-col w-full justify-between min-h-max h-1/5 max-h-25">
              <VideoTimeline videoRef={videoRef} videoState={videoState} />
              <VideoControls
                seek={seek}
                videoRef={videoRef}
                videoState={videoState}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showControls && videoState.playbackStarted && (
        <div className="absolute z-15 top-0 left-0 h-full w-full">
          <VideoClickRegister
            videoState={videoState}
            vidRef={videoRef}
            showControlsFn={() => setShowControls(true)}
            seekFn={seek}
            isPaused={videoState.paused}
          />
        </div>
      )}

      {!videoState.playbackStarted && (
        <div className="absolute z-15 w-full flex items-center justify-center h-full top-0 left-0 bg-[rgb(0,0,0,0.5)]">
          <button
            onClick={() => {
              videoRef?.current?.play();
            }}
            disabled={videoState.loading}
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
