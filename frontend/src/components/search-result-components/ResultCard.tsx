"use client"

import useSearch from "@/src/hooks/useSearch";
import { SearchResult } from "@/src/types/matesTypes";
import { FaArrowRight, FaEye } from "react-icons/fa";
import LoadRoller from "../reusable-components/LoadRoller";

const ResultCard = ({ result }: { result: SearchResult }) => {
  const { search, isFetching } = useSearch();

  return (
    <div
      onClick={() =>
        search(`https://www.youtube.com/watch?v=${result.video_id}`)
      }
      className="w-full cursor-pointer px-2 py-3 rounded-md hover:scale-[1.03] transition-all ease-in shadow-[0px_0px_10px_-6px_var(--text-primary-light)]"
    >
      <div className="w-full aspect-video rounded-md mb-2 overflow-hidden">
        <img className="object-center object-cover w-full h-full" src={result.thumbnails?.[0]} alt={"Thumbnail"} />
      </div>
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-2">
          <p className="text-lg font-medium text-(--text-primary)">{result.title}</p>
          <p className="text-base flex gap-2 items-center text-(--text-primary-light) font-medium">
            Views: <FaEye /> {result.view_count}
          </p>
        </div>
        <button
          className={`text-xl text-(--text-primary) ${isFetching ? "py-1.5 px-3" : "p-3"} rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-semibold`}
          onClick={() =>
            search(`https://www.youtube.com/watch?v=${result.video_id}`)
          }
        >
          {isFetching ? (
            <LoadRoller size={18} strokeWidth={14} />
          ) : (
            <FaArrowRight />
          )}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
