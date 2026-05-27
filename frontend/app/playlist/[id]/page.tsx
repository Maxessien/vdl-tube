import PlaylistBanner from "@/src/components/playlist-components/PlaylistBanner";
import PlaylistVideoCard from "@/src/components/playlist-components/PlaylistVideoCard";
import { PlaylistInfo, PlaylistVideo } from "@/src/types/matesTypes";
import { getPlaylist } from "@/src/utils/youtubei";
import { YTNodes } from "youtubei.js";

const PlaylistPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const playlist = await getPlaylist((await params).id);

  const {
    author,
    last_updated,
    subtitle,
    thumbnails,
    total_items,
    description,
    title,
    views,
    type,
  } = playlist.info;

  const info: PlaylistInfo = {
    last_updated,
    subtitle: subtitle.toString(),
    thumbnails: thumbnails.map(({ height, url, width }) => ({
      height,
      url,
      width,
    })),
    author: {
      name: author.name,
      thumbnails: author.thumbnails.map((val) => ({ ...val })),
    },
    total_items,
    views,
    description,
    title,
    type,
  };

  const videos: PlaylistVideo[] = playlist.videos
    .filter((v) => v.is(YTNodes.CompactVideo))
    .map(({ thumbnails, title, duration, video_id }) => ({
      duration,
      thumbnails: thumbnails.map((th) => ({ ...th })),
      title: title.toString(),
      videoId: video_id,
    }));

  return (
    <div>
      <PlaylistBanner info={info} />
      <div>
        {videos.map((v) => (
          <PlaylistVideoCard videoInfo={v} key={v.videoId} />
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
