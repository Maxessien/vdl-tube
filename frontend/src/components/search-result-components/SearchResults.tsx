"use client"

import {
  SerializedPlaylistResult,
  SerializedVideoResult,
} from "@/src/types/matesTypes";
import { useState } from "react";
import ResultCard from "./ResultCard";
import ResultPlaylistCard from "./ResultPlaylistCard";

const SearchResults = ({
  videos,
  playlists,
}: {
  videos: SerializedVideoResult[];
  playlists: SerializedPlaylistResult[];
}) => {
  const [tab, setTab] = useState<"videos" | "playlists" | "channels">("videos");
  return (
    <div className="space-y-4">
      <div className="w-full mx-auto flex justify-center items-center max-w-xl">
        <button
          className={`flex-1 font-medium text-(--text-primary) hover:bg-(--main-secondary-light) transition-all text-center px-3 py-2 ${tab === "videos" ? "border-b-2 border-b-(--main-primary-light)" : ""}`}
          onClick={() => setTab("videos")}
        >
          Videos
        </button>
        <button
          className={`flex-1 font-medium text-(--text-primary) hover:bg-(--main-secondary-light) transition-all text-center px-3 py-2 ${tab === "playlists" ? "border-b-2 border-b-(--main-primary-light)" : ""}`}
          onClick={() => setTab("playlists")}
        >
          Playlists
        </button>
      </div>
      {tab === "videos" &&
        (videos?.length > 0 ? (
          <ul className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl gap-3">
            {videos.map((result, idx) => {
              return <ResultCard key={idx} result={result} />;
            })}
          </ul>
        ) : (
          <p className="text-lg font-medium w-full text-center text-(--text-primary)">
            No Videos Found
          </p>
        ))}

      {tab === "playlists" &&
        (playlists?.length > 0 ? (
          <ul className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl gap-3">
            {playlists.map((result, idx) => {
              return <ResultPlaylistCard res={result} key={idx} />;
            })}
          </ul>
        ) : (
          <p className="text-lg font-medium w-full text-center text-(--text-primary)">
            No Playlists Found
          </p>
        ))}
    </div>
  );
};

export default SearchResults;
