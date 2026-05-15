import { Innertube, UniversalCache, YTNodes } from "youtubei.js";
import logger from "./logger";


const youtube = await Innertube.create({
  cache: new UniversalCache(true, "/tmp/ytjs-cache"),
});

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
          ? [best_thumbnail.url, ...thumbnails.map(({ url }) => url)]
          : thumbnails.map(({ url }) => url),
        duration,
        view_count: view_count.toString(),
      }),
    );
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getVideoChapters = async (videoId: string) => {
  try {
    const info = await youtube.getInfo(videoId);
    const chapters =
      info.player_overlays.decorated_player_bar.player_bar.markers_map?.[0]
        .value.chapters;
    return chapters?.length > 0
      ? chapters.map(({ title, time_range_start_millis }) => ({
          title: title.toString(),
          start: time_range_start_millis / 1000,
        }))
      : [];
  } catch (err) {
    logger.error("Error getting video chapters", err)
    return [];
  }
};

const getSearchSuggestions = async(query: string)=>{
  try {
    const suggestions = await youtube.getSearchSuggestions(query)
    return suggestions
  } catch (err) {
    logger.error("Error getting search suggestions", err)
    return []
  }
}

export { getSearchSuggestions, getVideoChapters, searchVideo, youtube };

