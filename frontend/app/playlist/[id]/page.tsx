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
    subtitle: subtitle?.toString(),
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
    .filter((v) => v.is(YTNodes.CompactVideo) || v.is(YTNodes.Video) || v.is(YTNodes.PlaylistVideo))
    .map((v) => {
      const { thumbnails, title, duration } = v
      const id = v.is(YTNodes.PlaylistVideo) ? v.id : v.video_id
      return {
      duration,
      thumbnails: thumbnails.map((th) => ({ ...th })),
      title: title.toString(),
      videoId: id,
    }
    });

  console.log(playlist.videos)

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-400 mx-auto p-4 lg:p-6 text-(--text-primary) min-h-screen">
      {/* Left Column: Fixed Banner Panel */}
      <div className="w-full lg:w-90 xl:w-100 lg:shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
        <PlaylistBanner info={info} />
      </div>

      {/* Right Column: Scrollable Playlist Items */}
      <div className="flex-1 flex flex-col gap-1.5 w-full">
        {videos.map((v) => (
          <PlaylistVideoCard videoInfo={v} key={v.videoId} />
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
