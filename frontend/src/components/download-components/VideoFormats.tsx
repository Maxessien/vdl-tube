"use client";

import { RootState } from "@/src/store";
import type { VideoFormat } from "@/src/types/matesTypes";
import { resolveDownloadUrl } from "@/src/utils/mate";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";
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

const VideoFormats = ({ id }: { id: string }) => {
  const infos = useSelector((state: RootState) => state.infoMappings);
  const [vidUrl, setVidUrl] = useState<string[]>([]);
  const info = infos?.[id];

  if (!info) return notFound();

  const [qualityInfo, setQualityInfo] = useState<{
    isOpen: boolean;
    quality: number;
  }>({ isOpen: false, quality: info.video_formats?.[0].quality });

  const getVidUrl = async (quality: string) => {
    const { data } = await resolveDownloadUrl(
      info.key,
      quality,
      "video",
      null,
      info.titleSlug,
    );
    return `/api/download?url=${data.downloadUrl}&stream=true`;
  };

  useEffect(() => {
    (async () => {
      const urls: string[] = []
      for (const format of info.video_formats){
        const url = await getVidUrl(format.quality.toString())
        urls.push(url)
      }
      setVidUrl(urls);
    })();
  }, []);

  return (
    <section className="px-3 py-4 max-w-lg mx-auto">
      {/* <img
        className="w-full"
        src={info?.thumbnail ?? info?.thumbnail_formats?.[0].url}
        alt={`${info?.title} thumbnail`}
      /> */}

      {vidUrl?.length > 0 && <VideoPlayer posterUrl={info?.thumbnail ?? info?.thumbnail_formats?.[0].url} title={info.title} urls={vidUrl} />}
      <h1 className="text-2xl text-(--text-primary) my-3 w-full text-center font-semibold">
        {info?.title}
      </h1>

      {info?.video_formats.length > 0 && !qualityInfo.isOpen && (
        <ul className="space-y-4">
          {info?.video_formats.map((format, index) => (
            <FormatsListCard
              key={index}
              openInfo={() =>
                setQualityInfo({ isOpen: true, quality: format.quality })
              }
              format={format}
            />
          ))}
        </ul>
      )}

      {qualityInfo.isOpen && (
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
  );
};

export default VideoFormats;
