"use client";

import { RootState } from "@/src/store";
import type { VideoFormat } from "@/src/types/matesTypes";
import { resolveDownloadUrl } from "@/src/utils/mate";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { v4 } from "uuid";
import LoadRoller from "../reusable-components/LoadRoller";
import VideoPlayer from "../video-player/VideoPlayer";
import QualityInfo from "./QualityInfo";

const FormatsListCard = ({
  format,
  openInfo,
}: {
  format: VideoFormat;
  openInfo: () => void;
}) => {
  const { quality } = format;

  return (
    <li className="w-full flex justify-between items-center px-3 py-5 space-y-3 text-left rounded-md bg-(--main-secondary-light) shadow-md shadow-gray-700">
      <p className="text-xl text-(--text-primary) font-bold">
        Quality - {quality}P
      </p>
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

const VideoFormats = ({ id }: { id: string }) => {
  const infos = useSelector((state: RootState) => state.infoMappings);
  const [vidUrls, setVidUrls] = useState<UrlInfo[]>([]);
  const info = infos?.[id];

  const [qualityInfo, setQualityInfo] = useState<{
    isOpen: boolean;
    quality: number;
  }>({
    isOpen: false,
    quality: info?.video_formats?.[0].quality,
  });

  const getVidUrl = async (quality: string) => {
    try {
      const { data } = await resolveDownloadUrl(
        info?.key,
        quality,
        "video",
        null,
        info?.titleSlug,
      );
      if (!data) return null;
      return `/api/download?url=${data?.downloadUrl}&stream=true`;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!info) return;
      for (const format of info.video_formats) {
        if (!isMounted) break;
        const formatUrl = await getVidUrl(format.quality.toString());
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
  }, []);

  if (!info) return notFound();

  return (
    <section className="md:grid md:grid-cols-[70%_30%] gap-3 md:justify-between mx-auto">
      <div className="md:h-full max-h-screen md:px-3 md:py-4 w-full md:w-auto max-w-full pb-5 aspect-video">
        {vidUrls?.length > 0 ? (
          <VideoPlayer
            posterUrl={info?.thumbnail ?? info?.thumbnail_formats?.[0].url}
            title={info?.title}
            urls={vidUrls}
          />
        ) : (
          <div className="max-w-4xl w-full relative aspect-video">
            <div className="absolute z-5 w-full flex items-center justify-center h-full top-0 left-0 bg-[rgb(0,0,0,0.4)]">
              <div className="bg-[rgb(0,0,0,0.8)] w-13 h-13 sm:w-20 sm:h-20 rounded-full p-3">
                <LoadRoller strokeWidth={7} className="text-(--text-primary)" />
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

        {(info?.video_formats?.length ?? 0) > 0 && !qualityInfo?.isOpen && (
          <ul className="space-y-4">
            {info?.video_formats.map((format, index) => (
              <FormatsListCard
                key={index}
                openInfo={() =>
                  setQualityInfo({
                    isOpen: true,
                    quality: format.quality,
                  })
                }
                format={format}
              />
            ))}
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
              quality={qualityInfo?.quality}
              closeInfoFn={() =>
                setQualityInfo((state) => ({ ...state, isOpen: false }))
              }
            />
          </motion.div>
        )}
      </section>
    </section>
  );
};

export default VideoFormats;
