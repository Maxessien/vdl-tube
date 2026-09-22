import VideoFormats from "@/src/components/download-components/VideoFormats";
import { YtdlpFormatsRes } from "@/src/types/ytdlpTypes";
import axios from "axios";
import type { Metadata } from "next";
import { v4 } from "uuid";

export const metadata: Metadata = {
  title: "VDL Tube - Download",
};

interface DownloadPageProps {
  searchParams: Promise<{ vid_url: string }>;
}

const DownloadPage = async ({ searchParams }: DownloadPageProps) => {
  const spar = await searchParams;

  let ytFormats:
    | {
        audio: (YtdlpFormatsRes & { mapId: string })[];
        video: (YtdlpFormatsRes & { mapId: string })[];
      }
    | undefined;

  // try {
  //   const { data } = await axios.get<{
  //     audio_formats: YtdlpFormatsRes[];
  //     video_formats: YtdlpFormatsRes[];
  //   }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/formats`, {
  //     params: { url: spar.vid_url },
  //   });
    
  //   ytFormats = {
  //     audio: data.audio_formats.map((v) => ({ ...v, mapId: v4() })),
  //     video: data.video_formats.map((v) => ({ ...v, mapId: v4() })),
  //   };
  // } catch (error) {
  //   console.log(`Error getting ytdlp formats`, error)
  // }

  return (
    <VideoFormats
      hasYtlp={(ytFormats?.video?.[0]?.format_id?.length ?? 0) > 0}
      ytdlpFormats={ytFormats}
      url={spar.vid_url}
    />
  );
};

export default DownloadPage;
