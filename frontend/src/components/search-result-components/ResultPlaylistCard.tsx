/* eslint-disable @next/next/no-img-element */
import { SerializedPlaylistResult } from "@/src/types/matesTypes";
import Link from "next/link";

const ResultPlaylistCard = ({ res }: { res: SerializedPlaylistResult }) => {
  return (
    <Link href={`/playlist?id=${res.id}`}>
      <div className="w-full cursor-pointer px-2 py-3 rounded-md hover:scale-[1.03] focus:scale-[1.03] transition-all ease-in shadow-[0px_0px_10px_-6px_var(--text-primary-light)]">
        <div className="w-full aspect-video overflow-hidden rounded-md">
          <picture>
            {res.thumbnails?.sort((a, b)=> a?.width - b?.width).map(({ url }, idx) => (
              <source key={idx} srcSet={url} />
            ))}
            <img
              src={res?.thumbnails?.[res.thumbnails.length - 1].url}
              className="w-full h-full object-cover object-center"
              alt="Thumbnail"
            />
          </picture>
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
