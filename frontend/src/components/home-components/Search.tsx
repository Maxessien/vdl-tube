"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import LoadRoller from "../reusable-components/LoadRoller";
import useSearch from "@/src/hooks/useSearch";




const Search = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");


  const handleInputChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(value);
  };

  const {search, isFetching} = useSearch()

  return (
    <div className="w-full flex justify-start items-center pl-2 bg-(--main-secondary-light) rounded-full">
      <button
        onClick={()=>search(videoUrl)}
        className={`text-xl text-(--text-primary) ${isFetching ? "py-1.5 px-3" : "p-3"} rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-semibold`}
      >
        {isFetching ? <LoadRoller size={18} strokeWidth={14} /> : <FaSearch />}
      </button>
      <input
        value={videoUrl}
        placeholder="Search video or Paste video url"
        onChange={handleInputChange}
        className="w-full placeholder:text-(--text-primary-light) rounded-[0px_9999px_9999px_0px] focus:outline-0 py-3 px-2 font-medium text-lg text-(--text-primary)"
        type="text"
      />
    </div>
  );
};

export default Search;
