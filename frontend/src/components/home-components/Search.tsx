"use client";

import { useRouter } from "nextjs-toploader/app";
import { FaSearch } from "react-icons/fa";




const Search = () => {

  const router = useRouter()

  return (
    <div className="w-full flex justify-start items-center pl-2 bg-(--main-secondary-light) rounded-full">
      <button
        disabled
        className={`text-xl text-(--text-primary) p-3 rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-semibold`}
      >
        <FaSearch />
      </button>
      <input
        placeholder="Search video or Paste video url"
        className="w-full placeholder:text-base placeholder:text-(--text-primary-light) rounded-[0px_9999px_9999px_0px] focus:outline-0 py-3 px-2 font-medium text-lg text-(--text-primary)"
        type="text"
        onClick={()=> router.push("/query")}
        onFocus={()=> router.push("/query")}
      />
    </div>
  );
};

export default Search;
