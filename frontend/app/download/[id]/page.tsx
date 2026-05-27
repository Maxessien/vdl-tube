import VideoFormats from "@/src/components/download-components/VideoFormats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VDL Tube - Download",
};

interface DownloadPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{id: string}>
}

const DownloadPage = async ({ params, searchParams }: DownloadPageProps) => {
  const par = await params
  
  return <VideoFormats id={par.id} />
};

export default DownloadPage;
