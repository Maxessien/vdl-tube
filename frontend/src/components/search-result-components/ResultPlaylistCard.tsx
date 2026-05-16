/* eslint-disable @next/next/no-img-element */
import {
  SerializedPlaylistResult,
} from "@/src/types/matesTypes";
import Link from "next/link";

const ResultPlaylistCard = ({ res }: { res: SerializedPlaylistResult }) => {

  const largestThumbnail = res.thumbnails.reduce((prev, curr) =>
    (prev.width || 0) > (curr.width || 0) ? prev : curr,
    {width: 0, url: ""}
  ) || res.thumbnails[0];

  return (
    <Link href={`/playlist?id=${res.id}`}>
      <div className="w-full cursor-pointer px-2 py-3 rounded-md hover:scale-[1.03] focus:scale-[1.03] transition-all ease-in shadow-[0px_0px_10px_-6px_var(--text-primary-light)]">
        <div className="w-full aspect-video overflow-hidden rounded-md">
          {largestThumbnail && (
            <img
              src={largestThumbnail.url}
              className="w-full h-full object-cover object-center"
              alt="Thumbnail"
            />
          )}
        </div>
        <div className="w-full flex justify-start items-center gap-2">
          <div className="w-7 overflow-hidden aspect-square rounded-full border-2 border-(--text-primary-light)">
            {res.authorThumbnail && (
              <img
                src={res.authorThumbnail}
                alt={res.author}
                className="w-full h-full object-cover object-center"
              />
            )}
          </div>
          <p className="text-base text-(--text-primary) font-medium">
            {res.author}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ResultPlaylistCard;
