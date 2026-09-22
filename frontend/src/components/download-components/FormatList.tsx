import { DownloadOption, getVideoInfo, YtkVideoInfo } from "@/app/actions";
import { AudioFormat, ContentType, VideoFormat } from "@/src/types/matesTypes";
import { formatFilesize } from "@/src/utils/downloader";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import QualityInfo from "./QualityInfo";
import { useQuery } from "@tanstack/react-query";
import FormatsHeaders from "./FormatsHeaders";

const FormatsListCard = ({
  quality,
  openInfo,
  type,
  fileSize,
}: {
  quality: number | string;
  fileSize?: number | string;
  openInfo: () => void;
  type: "audio" | "video";
}) => {
  return (
    <li className="w-full flex justify-between items-center px-3 py-5 space-y-3 text-left rounded-md bg-(--main-secondary-light) shadow-md shadow-gray-700">
      <div className="flex-1 space-y-3">
        <p className="text-xl text-(--text-primary) font-bold">
          Quality - {quality}
          {typeof quality === "number" ? (type === "audio" ? "K" : "P") : ""}
        </p>
        <p className="text-sm md:text-base text-(--text-primary-light) leading-1 font-semibold">
          {typeof fileSize === "number" ? formatFilesize(fileSize) : fileSize}
        </p>
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

export const FormatsList = ({
  format,
  vidOptions,
  audOptions,
  setQualityInfo,
}: {
  format: "audio" | "video";
  setQualityInfo: (val: any) => void;
  vidOptions: {
    filesize?: number | string;
    info: DownloadOption | VideoFormat;
  }[];
  audOptions: {
    filesize?: number | string;
    info: DownloadOption | AudioFormat;
  }[];
}) => {
  return (
    <ul className="space-y-4">
      {format === "video" ? (
        (vidOptions?.length ?? 0) > 0 ? (
          vidOptions.map(({ filesize, info }, index) => (
            <FormatsListCard
              key={index}
              openInfo={()=> setQualityInfo(info)}
              type={format}
              quality={info.quality}
              fileSize={filesize}
            />
          ))
        ) : (
          <p className="w-full text-center text-(--text-primary) text-lg font-semibold">
            No Video format
          </p>
        )
      ) : (audOptions?.length ?? 0) > 0 ? (
        audOptions.map(({ filesize, info }, index) => (
          <FormatsListCard
            key={index}
            openInfo={()=> setQualityInfo(info)}
            type={format}
            quality={info.quality}
            fileSize={filesize}
          />
        ))
      ) : (
        <p className="w-full text-center text-(--text-primary) text-lg font-semibold">
          No Audio format
        </p>
      )}
    </ul>
  );
};
