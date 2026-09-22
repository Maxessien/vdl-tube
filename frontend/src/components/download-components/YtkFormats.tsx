import { DownloadOption, getVideoInfo, YtkVideoInfo } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FormatsHeaders from "./FormatsHeaders";
import { FormatsList } from "./FormatList";
import { motion } from "framer-motion";
import QualityInfo from "./QualityInfo";
import { notFound } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

export const YtkFormats = ({
  infoIsOpened,
  setIsOpened,
  url,
}: {
  infoIsOpened: boolean;
  url: string;
  setIsOpened: (val: boolean) => void;
}) => {
  const [qualityInfo, setQualityInfo] = useState<{
    selected: DownloadOption | null;
    formats: "audio" | "video";
  }>({
    selected: null,
    formats: "video",
  });

  const { data, isFetching } = useQuery({
    queryKey: [url, "ytk-video-info"],
    queryFn: async () => {
      const res = await getVideoInfo(url);

      return {
        info: res,
        options: {
          vid: res.videoOptions.map((vid) => ({
            info: vid,
            filesize: vid.size,
          })),
          aud: res.audioOptions.map((aud) => ({
            info: aud,
            filesize: aud.size,
          })),
        },
      };
    },
  });

  if (!data && !isFetching) return notFound();
  if (isFetching)
    return (
      <div className="w-full flex justify-center">
        <FaSpinner className="animate-spin text-(--text-primary)" size={50} />
      </div>
    );

  function formatSelection(val: DownloadOption) {
    setQualityInfo((st) => ({ ...st, selected: val }));
    setIsOpened(true);
  }

  return (
    <>
      <FormatsHeaders
        vidTitle={data.info.title}
        format={qualityInfo.formats}
        setFormat={(f) => setQualityInfo((st) => ({ ...st, formats: f }))}
      />

      {!infoIsOpened && (
        <FormatsList
          setQualityInfo={formatSelection}
          vidOptions={data.options.vid}
          format={qualityInfo.formats}
          audOptions={data.options.aud}
        />
      )}

      {infoIsOpened && (
        <motion.div
          initial={{ left: "120vw", opacity: 0.6 }}
          animate={{ left: "0%", opacity: 1 }}
          transition={{ duration: 0.75, ease: "easeIn" }}
        >
          <QualityInfo
            info={null}
            closeInfoFn={() => {
              setQualityInfo((state) => ({ ...state, selected: null }));
              setIsOpened(false);
            }}
            ytkInfo={{ ...qualityInfo.selected, title: data.info.title, id: data.info.videoId, duration: data.info.durationSeconds }}
            formatType={qualityInfo.formats}
          />
        </motion.div>
      )}
    </>
  );
};

export default YtkFormats;
