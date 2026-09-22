import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FormatsHeaders, { FormatLoading, ServerLoadingError } from "./FormatsHeaders";
import { FormatsList } from "./FormatList";
import { motion } from "framer-motion";
import QualityInfo from "./QualityInfo";
import { AudioFormat, VideoFormat } from "@/src/types/matesTypes";
import { getVideoInfo } from "@/src/utils/mate";

export const YtMateFormats = ({
  infoIsOpened,
  url,
  setIsOpened,
}: {
  infoIsOpened: boolean;
  url: string;
  setIsOpened: (val: boolean) => void;
}) => {
  const [qualityInfo, setQualityInfo] = useState<{
    selected: VideoFormat | AudioFormat | null;
    formats: "audio" | "video";
  }>({
    selected: null,
    formats: "video",
  });

  const { data, isFetching } = useQuery({
    queryKey: [url, "ytmate-video-info"],
    queryFn: async () => {
      const res = await getVideoInfo(url);

      setQualityInfo((st) => ({ ...st, selected: res.video_formats[0] }));

      return {
        info: res,
        options: {
          vid: res.video_formats.map((info) => ({
            info,
            quality: info.quality,
          })),
          aud: res.audio_formats.map((info) => ({
            info,
            quality: info.quality,
          })),
        },
      };
    },
    staleTime: Infinity
  });

  function formatSelection(val: VideoFormat | AudioFormat) {
    setQualityInfo((st) => ({ ...st, selected: val }));
    setIsOpened(true);
  }

  if (!data && !isFetching) return <ServerLoadingError />;
  if (isFetching) return <FormatLoading />

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
            info={{ ...data.info, quality: qualityInfo.selected.quality ?? 0 }}
            closeInfoFn={() => {
              setQualityInfo((state) => ({ ...state, selected: null }));
              setIsOpened(false);
            }}
            ytkInfo={null}
            formatType={qualityInfo.formats}
          />
        </motion.div>
      )}
    </>
  );
};

export default YtMateFormats;
