import { UserHomeFeed } from "@/src/types/matesTypes";
import { FaEye } from "react-icons/fa";

type ShortsType = UserHomeFeed["shorts"];
let holder: ShortsType;

const ShortsFeedCards = ({ shorts }: { shorts: (typeof holder)[number] }) => {
  return (
    <div className="w-full rounded-md overflow-hidden relative aspect-9/16">
      <picture>
        {shorts.thumbnails
          .sort((a, b) => a.width - b.width)
          .map(({ url }, idx) => (
            <source key={idx} srcSet={url} />
          ))}
        <img
          className="object-cover object-center"
          src={shorts.thumbnails?.[0].url}
          alt="Thumbnail"
        />
      </picture>
      <div className="absolute hover:bg-[#00000029] transition-all flex flex-col gap-2 justify-end items-start top-0 left-0 w-full h-full">
        <p className="w-full text-base font-medium text-shadow-sm text-shadow-black text-(--text-primary)">
          {shorts.title}
        </p>
        <p className="w-full flex justify-start items-center gap-2 text-base font-medium text-shadow-sm text-shadow-black text-(--text-primary)">
          <FaEye /> {shorts.views}
        </p>
      </div>
    </div>
  );
};

export default ShortsFeedCards;
