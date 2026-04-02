import { Innertube, UniversalCache, YTNodes } from "youtubei.js";
const youtube = await Innertube.create({ cache: new UniversalCache(true) });


const searchVideo = async (query: string) => {
  try {
    if (!query?.toString()?.trim()) throw new Error("Invalid query");

    const vids = await youtube.search(query.toString());
    const filtered = vids.videos.filter(
      (item) => item.is(YTNodes.Video) || item.is(YTNodes.CompactVideo),
    );
    return filtered.map(
      ({
        title,
        video_id,
        thumbnails,
        best_thumbnail,
        duration,
        view_count,
        
      }) => ({
        title: title.toString(),
        video_id,
        thumbnails: best_thumbnail
          ? [best_thumbnail.url, ...thumbnails.map(({url})=>url)]
          : thumbnails.map(({url})=>url),
        duration,
        view_count,
      }),
    );
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getVideoChapters = async(videoId: string)=>{
    try {
        const info = await youtube.getInfo(videoId)
        return info.player_overlays.decorated_player_bar.player_bar.markers_map?.[0].value.chapters ?? null
    } catch (err) {
        console.log(err);
        return null;
    }
}


export { searchVideo, youtube, getVideoChapters };
