"use client";

import { RootState } from "@/src/store";
import type {
  AudioFormat,
  ContentType,
  VideoFormat,
} from "@/src/types/matesTypes";
import {
  formatFilesize,
  getVidUrl,
  IFRAME_EMBED_URL,
} from "@/src/utils/downloader";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowRight, FaSpinner } from "react-icons/fa";
import { useSelector } from "react-redux";
import { v4 } from "uuid";
import VideoPlayer from "../video-player/VideoPlayer";
import QualityInfo from "./QualityInfo";
import { YtdlpFormatsRes } from "@/src/types/ytdlpTypes";

const FormatsListCard = ({
  quality,
  openInfo,
  type,
  fileSize,
}: {
  quality: number | string;
  fileSize?: number;
  openInfo: () => void;
  type: "audio" | "video";
}) => {
  return (
    <li className="w-full flex justify-between items-center px-3 py-5 space-y-3 text-left rounded-md bg-(--main-secondary-light) shadow-md shadow-gray-700">
      <div className="flex-1 space-y-1">
        <p className="text-xl text-(--text-primary) font-bold">
          Quality - {quality}
          {type === "audio" ? "K" : "P"}
        </p>
        <p>{formatFilesize(fileSize)}</p>
      </div>
      <button
        onClick={openInfo}
        className="flex disabled:opacity-75 py-2 px-4 justify-center items-center text-base text-(--text-primary) not-visited:rounded-full bg-(--main-primary) font-semibold"
      >
        <FaArrowRight />
      </button>
    </li>
  );
};

export interface UrlInfo {
  url: string;
  quality: number;
  id: string;
}

const VideoFormats = ({
  id,
  hasYtlp,
  ytdlpFormats,
}: {
  id: string;
  hasYtlp: boolean;
  ytdlpFormats?: {
    audio: (YtdlpFormatsRes & { mapId: string })[];
    video: (YtdlpFormatsRes & { mapId: string })[];
  };
}) => {
  const infos = useSelector((state: RootState) => state.infoMappings);
  const [vidUrls, setVidUrls] = useState<UrlInfo[]>([]);
  const info = infos?.[id];

  const infoAudio = info.audio_formats.map((v) => ({
    ...v,
    mapId: v.quality.toString(),
  }));
  const infoVideo = info.video_formats.map((v) => ({
    ...v,
    mapId: v.quality.toString(),
  }));

  const [formatView, setFormatView] = useState<"audio" | "video">("video");
  const [iframeState, setIframeState] = useState({
    working: true,
    currentTime: 0,
    loaded: false,
  });

  const [server, setServer] = useState<{
    id: "server1" | "server2";
    vidFormats: { quality: number; filesize?: number; mapId: string }[] | null;
    audioFormats:
      | { quality: number; filesize?: number; mapId: string }[]
      | null;
    selected: { id: string; type: ContentType };
  }>({
    id: "server1",
    vidFormats:
      (hasYtlp
        ? ytdlpFormats.video.map(
            ({ quality, mapId, filesize, filesize_approx }) => ({
              quality,
              filesize: filesize || filesize_approx || null,
              mapId,
            }),
          )
        : infoVideo) ?? null,
    audioFormats:
      (hasYtlp
        ? ytdlpFormats.audio.map(
            ({ quality, mapId, filesize, filesize_approx }) => ({
              quality,
              filesize: filesize || filesize_approx || null,
              mapId,
            }),
          )
        : infoAudio) ?? null,
    selected: {
      id: hasYtlp
        ? ytdlpFormats.video?.[0].mapId
        : info?.video_formats?.[0]?.quality.toString(),
      type: "video",
    },
  });

  const iframeCountdownRef = useRef<NodeJS.Timeout>(null);

  const [qualityInfo, setQualityInfo] = useState<{
    isOpen: boolean;
    mapId: number | string;
  }>({
    isOpen: false,
    mapId: server.vidFormats?.[0]?.quality ?? info?.video_formats?.[0].quality,
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      console.log(iframeState);
      if (iframeState.working) return;
      if (!info) return;

      const formats = [...info.video_formats];
      for (const format of formats?.reverse()) {
        if (!isMounted) break;

        const formatUrl = await getVidUrl(
          format.quality.toString(),
          info?.key,
          info?.titleSlug,
        );

        if (formatUrl) {
          setVidUrls((state) => [
            ...state,
            {
              quality: format.quality,
              url: formatUrl,
              id: v4(),
            },
          ]);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeState.working]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) {
      iframeCountdownRef.current = setTimeout(() => {
        setIframeState((state) => ({ ...state, working: false }));
      }, 15000);
    }

    return () => clearTimeout(iframeCountdownRef.current);
  }, [info.id, setIframeState]);

  const availableServers = useMemo(
    () =>
      hasYtlp
        ? {
            server1: ytdlpFormats,
            server2: { audio: infoAudio, video: infoVideo },
          }
        : { server1: { audio: infoAudio, video: infoVideo } },
    [hasYtlp, infoAudio, infoVideo, ytdlpFormats],
  );

  useEffect(() => {
    
    setServer((st) => ({
      ...st,
      vidFormats: availableServers[st.id].video,
      audioFormats: availableServers[st.id].audio,
    }));

  }, [server.id, availableServers]);

  if (!info) return notFound();

  return (
    <section className="md:grid md:grid-cols-[70%_30%] gap-3 md:justify-between mx-auto">
      <div
        style={iframeState.loaded ? { border: "none" } : undefined}
        className="md:h-full border-2 border-(--main-primary) max-h-screen w-full md:w-auto max-w-full overflow-hidden aspect-video"
      >
        {iframeState.working ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full object-contain object-center"
            src={`${IFRAME_EMBED_URL}/${info.id}`}
            allowFullScreen
            // onError={() => {
            //   setIframeState((state) => ({ ...state, working: false }));
            // }}
            onLoad={() => {
              clearTimeout(iframeCountdownRef.current);
              setIframeState((state) => ({
                ...state,
                working: true,
                loaded: true,
              }));
            }}
          />
        ) : vidUrls?.length > 0 ? (
          <VideoPlayer
            posterUrl={info?.thumbnail ?? info?.thumbnail_formats?.[0].url}
            title={info?.title}
            urls={vidUrls}
            defaultStartTime={iframeState.currentTime}
          />
        ) : (
          <div className="max-w-4xl w-full relative aspect-video">
            <div className="absolute z-5 w-full flex items-center justify-center h-full top-0 left-0 bg-[rgb(0,0,0,0.4)]">
              <div className="bg-[rgb(0,0,0,0.8)] rounded-full p-2 sm:p-3">
                <FaSpinner className="text-3xl sm:text-6xl text-(--text-primary) animate-spin" />
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={info?.thumbnail ?? info?.thumbnail_formats?.[0].url}
              alt={info?.title}
              className="w-full"
            />
          </div>
        )}
      </div>
      <section className="w-full px-3 py-4">
        <h1 className="text-2xl text-(--text-primary) my-3 w-full text-center font-semibold">
          {info?.title}
        </h1>

        <div className="flex mb-3 w-full items-end">
          <button
            onClick={() => {
              setQualityInfo((state) => ({ ...state, isOpen: false }));
              setFormatView("video");
            }}
            className={`flex-1 ${formatView === "video" ? "border-b-2 border-b-(--main-primary)" : ""} hover:bg-(--main-secondary-light) font-semibold px-2 py-3 text-(--text-primary) text-xl`}
          >
            Video
          </button>
          <button
            onClick={() => {
              setQualityInfo((state) => ({ ...state, isOpen: false }));
              setFormatView("audio");
            }}
            className={`flex-1 ${formatView === "audio" ? "border-b-2 border-b-(--main-primary)" : ""} hover:bg-(--main-secondary-light) font-semibold px-2 py-3 text-(--text-primary) text-xl`}
          >
            Audio
          </button>
        </div>

        {!qualityInfo?.isOpen && (
          <ul className="space-y-4">
            {formatView === "video" ? (
              server?.vidFormats.length > 0 ? (
                server?.vidFormats.map(
                  ({ filesize, mapId, quality }, index) => (
                    <FormatsListCard
                      key={index}
                      openInfo={() =>
                        setQualityInfo({
                          isOpen: true,
                          mapId,
                        })
                      }
                      type={formatView}
                      quality={quality}
                      fileSize={filesize}
                    />
                  ),
                )
              ) : (
                <p className="w-full text-center text-(--text-primary) text-lg font-semibold">
                  No Video format
                </p>
              )
            ) : server.audioFormats.length > 0 ? (
              server.audioFormats.map(({ filesize, mapId, quality }, index) => (
                <FormatsListCard
                  key={index}
                  openInfo={() =>
                    setQualityInfo({
                      isOpen: true,
                      mapId,
                    })
                  }
                  type={formatView}
                  quality={quality}
                  fileSize={filesize}
                />
              ))
            ) : (
              <p className="w-full text-center text-(--text-primary) text-lg font-semibold">
                No Audio format
              </p>
            )}
          </ul>
        )}

        {qualityInfo?.isOpen && (
          <motion.div
            initial={{ left: "120vw", opacity: 0.6 }}
            animate={{ left: "0%", opacity: 1 }}
            transition={{ duration: 0.75, ease: "easeIn" }}
          >
            <QualityInfo
              info={info}
              ytdlpFormats={
                hasYtlp
                  ? formatView === "video"
                    ? ytdlpFormats.video.find(
                        ({ mapId }) => qualityInfo.mapId === mapId,
                      )
                    : ytdlpFormats.audio.find(
                        ({ mapId }) => qualityInfo.mapId === mapId,
                      )
                  : null
              }
              quality={
                formatView === "video"
                  ? info.video_formats.find(
                      ({ quality }) => qualityInfo.mapId === quality,
                    ).quality
                  : info.audio_formats.find(
                      ({ quality }) => qualityInfo.mapId === quality,
                    ).quality
              }
              closeInfoFn={() =>
                setQualityInfo((state) => ({ ...state, isOpen: false }))
              }
              formatType={formatView}
            />
          </motion.div>
        )}
      </section>
    </section>
  );
};

export default VideoFormats;
