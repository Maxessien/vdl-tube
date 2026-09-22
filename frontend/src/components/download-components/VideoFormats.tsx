"use client";

import type { VideoInfo } from "@/src/types/matesTypes";
import { YtdlpFormatsRes } from "@/src/types/ytdlpTypes";
import { getYouTubeID, IFRAME_EMBED_URL } from "@/src/utils/downloader";
import { motion } from "framer-motion";
import { useState } from "react";
import QualityInfo from "./QualityInfo";
import { YtkVideoInfo } from "@/app/actions";
import YtkFormats from "./YtkFormats";
import YtMateFormats from "./YtMateFormats";

export interface UrlInfo {
  url: string;
  quality: number;
  id: string;
}

const VideoFormats = ({
  url,
  hasYtlp,
  ytdlpFormats,
}: {
  url: string;
  hasYtlp: boolean;
  ytdlpFormats?: {
    audio: (YtdlpFormatsRes & { mapId: string })[];
    video: (YtdlpFormatsRes & { mapId: string })[];
  };
}) => {
  const [server, setServer] = useState<{
    id: "server1" | "server2";
    infoIsOpened: boolean;
  }>({
    id: "server1",
    infoIsOpened: false,
  });

  return (
    <section className="md:grid md:grid-cols-[70%_30%] gap-3 md:justify-between mx-auto">
      <div className="md:h-full border-2 border-(--main-primary) max-h-screen w-full md:w-auto max-w-full overflow-hidden aspect-video">
        <iframe
          className="w-full h-full object-contain object-center"
          src={`${IFRAME_EMBED_URL}/${getYouTubeID(url)}`}
          allowFullScreen
        />
      </div>
      <section className="w-full px-3 py-4">
        {/* Server Selector Added Here */}
        <div className="flex justify-center items-center mb-4 w-full">
          <label
            htmlFor="server-selector"
            className="mr-3 text-(--text-primary) font-semibold"
          >
            Server:
          </label>
          <select
            id="server-selector"
            disabled={server.infoIsOpened}
            value={server.id}
            onChange={(e) =>
              setServer((prev) => ({
                ...prev,
                id: e.target.value as "server1" | "server2",
              }))
            }
            className="bg-(--main-secondary-light) text-(--text-primary) border border-gray-600 rounded-md px-3 py-1.5 outline-none focus:border-(--main-primary) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="server1">Server 1</option>
            <option value="server2">Server 2</option>
          </select>
        </div>

        {server.id === "server1" && (
          <YtkFormats
            url={url}
            infoIsOpened={server.infoIsOpened}
            setIsOpened={(val) =>
              setServer((st) => ({ ...st, infoIsOpened: val }))
            }
          />
        )}

        {server.id === "server2" && (
          <YtMateFormats
            url={url}
            infoIsOpened={server.infoIsOpened}
            setIsOpened={(val) =>
              setServer((st) => ({ ...st, infoIsOpened: val }))
            }
          />
        )}
      </section>
    </section>
  );
};

export default VideoFormats;
