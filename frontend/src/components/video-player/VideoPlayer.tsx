"use client";

import { RootState } from "@/src/store";
import { AnimatePresence, motion } from "framer-motion";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { useSelector } from "react-redux";
import { UrlInfo } from "../download-components/VideoFormats";
import VideoClickRegister from "./VideoClickRegister";
import VideoControls from "./VideoControls";
import VideoSettings from "./VideoSettings";
import VideoTimeline from "./VideoTimeline";

export interface VideoState {
  paused: boolean;
  playbackStarted: boolean;
  currentTime: number;
  loading: boolean;
  seeked: { direction: "forward" | "backward"; active: boolean };
  expanded: boolean;
  muted: boolean;
  startTime: number;
  selectedQuality: string;
  showSettings: boolean;
}

const VideoPlayer = ({
  urls,
  posterUrl,
  title,
}: {
  urls: UrlInfo[];
  posterUrl: string;
  title: string;
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
    startTime: 0,
    selectedQuality: urls?.[0]?.id ?? "",
    showSettings: false,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const { width } = useSelector((state: RootState) => state.screenSize);

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

    return removeAllListeners;
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    const newUrl = urls.find(
      ({ id }) => id === videoState.selectedQuality,
    )?.url;
    if (newUrl?.trim()) {
      videoRef.current.src = newUrl;
      videoRef.current.load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoState.selectedQuality]);

  const handleKeyEvent = (e: KeyboardEvent<HTMLDivElement>) => {
    const vidRef = videoRef?.current;
    if (!vidRef) return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        videoState.paused
          ? videoRef?.current?.play()
          : videoRef?.current?.pause();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (vidRef.volume < 0.95) vidRef.volume += 0.05;
        break;
      case "ArrowDown":
        e.preventDefault();
        if (vidRef.volume > 0.05) vidRef.volume -= 0.05;
        break;
      case "ArrowRight":
        e.preventDefault();
        seek(10, "forward");
        break;
      case "ArrowLeft":
        e.preventDefault();
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
        handleKeyEvent(e);
      }}
      className="w-full mx-auto relative flex justify-center items-center focus:outline-amber-700 focus:outline-2"
    >
      <video
        ref={videoRef}
        src={urls?.[0]?.url ?? ""}
        className="w-full max-h-screen z-5"
        preload="metadata"
        poster={posterUrl}
        onLoadedMetadata={(e) => {
          e.currentTarget.currentTime = videoState.startTime;
          if (videoState.startTime > 0) e.currentTarget.play();
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
        onWaiting={() =>
          setVideoState((state) => ({ ...state, loading: true }))
        }
        onVolumeChange={(e) => {
          const bool = e?.currentTarget?.muted || false;
          setVideoState((state) => ({ ...state, muted: bool }));
        }}
      ></video>
      <AnimatePresence>
        {videoState.playbackStarted && showControls && (
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.15, ease: "linear" }}
            className="absolute z-10 w-full flex flex-col h-full top-0 left-0"
          >
            <div className="w-full flex justify-between items-center gap-2 px-2 py-1.5 sm:px-2 sm:py-3 bg-[rgb(0,0,0,0.55)]">
              <p className="text-xs sm:text-sm md:text-base text-left font-medium text-(--text-primary) truncate">
                {title}
              </p>
              <div className="relative">
                <button
                  onClick={() =>
                    setVideoState((state) => ({
                      ...state,
                      showSettings: !state.showSettings,
                    }))
                  }
                  className="inline-flex justify-center items-center hover:bg-(--main-secondary-light) rounded-full p-0.5 sm:p-1 font-medium text-(--text-primary)"
                >
                  <MdSettings size={width > 480 ? 25 : 18} />
                </button>
                {videoState.showSettings && (
                  <div className="absolute top-full right-0">
                    <VideoSettings
                      urls={urls}
                      videoState={videoState}
                      changeSelected={(id) =>
                        setVideoState((state) => ({
                          ...state,
                          startTime: videoRef.current?.currentTime ?? 0,
                          selectedQuality: id,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
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
            <div className="bg-[rgb(0,0,0,0.55)] px-2 py-1.5 sm:px-3 sm:py-2 flex flex-col w-full justify-between gap-1 sm:gap-2 min-h-max h-[18%] sm:h-1/5 max-h-20 sm:max-h-25">
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
            className="inline-flex justify-center items-center p-2.5 sm:p-4 text-lg sm:text-2xl rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-medium text-(--text-primary)"
          >
            <FaPlay />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
