import VideoFormats from "@/src/components/download-components/VideoFormats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tube VDL - Download",
};

interface DownloadPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{id: string}>
}

const DownloadPage = async ({ params, searchParams }: DownloadPageProps) => {
  const par = await params
  const sPar = await searchParams
  
  return <VideoFormats id={par.id} />
};

export default DownloadPage;
