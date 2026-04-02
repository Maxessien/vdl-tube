import useSearch from "@/src/hooks/useSearch";
import { addInfo } from "@/src/store-slices/infoMappingsSlice";
import { SearchResult } from "@/src/types/matesTypes";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { FaArrowRight, FaEye } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import LoadRoller from "../reusable-components/LoadRoller";

const ResultCard = ({ result }: { result: SearchResult }) => {
  const { search, isFetching } = useSearch();

  return (
    <div>
      <div>
        <img src={result.thumbnails?.[0]} alt={"Thumbnail"} />
      </div>
      <div>
        <p>{result.title}</p>
        <p>
          Views: <FaEye /> {result.view_count}
        </p>
      </div>
      <button
        className={`text-xl text-(--text-primary) ${isFetching ? "py-1.5 px-3" : "p-3"} rounded-full bg-(--main-primary) hover:bg-(--main-primary-light) font-semibold`}
        onClick={() =>
          search(`https://www.youtube.com/watch?v=${result.video_id}`)
        }
      >
        {isFetching ? <LoadRoller size={18} strokeWidth={14} /> : <FaArrowRight />}
      </button>
    </div>
  );
};

export default ResultCard;
