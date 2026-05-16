"use server";

import { Innertube, OAuth2Tokens, UniversalCache, YTNodes } from "youtubei.js";
import logger from "./logger";

const youtube = await Innertube.create({
  cache: new UniversalCache(true, "/tmp/ytjs-cache"),
});

const searchVideo = async (query: string) => {
  try {
    if (!query?.toString()?.trim()) throw new Error("Invalid query");

    const vids = await youtube.search(query.toString());
    return vids;
  } catch (err) {
    logger.error("Search video err", err);
    return null;
  }
};

const getPlaylist = async (id: string) => {
  try {
    const playlist = await youtube.getPlaylist(id);
    return playlist;
  } catch (err) {
    logger.error("Get playlst err", err);
    return null;
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
    logger.error("Error getting video chapters", err);
    return [];
  }
};

const getSearchSuggestions = async (query: string) => {
  try {
    const suggestions = await youtube.getSearchSuggestions(query);
    return suggestions;
  } catch (err) {
    logger.error("Error getting search suggestions", err);
    return [];
  }
};

const getUserHomeFeed = async (yt: Innertube) => {
  try {
    const feed = await yt.getHomeFeed();
    const vids = feed.videos
      .filter(
        (v) =>
          v.is(YTNodes.Video) ||
          v.is(YTNodes.CompactVideo) ||
          v.is(YTNodes.GridVideo),
      )
      .map((v) => {
        const {
          author,
          duration,
          thumbnails,
          title,
          video_id,
          rich_thumbnail,
          short_view_count,
        } = v;
        return {
          author,
          duration,
          thumbnails,
          title: title.toString(),
          video_id,
          rich_thumbnail,
          views: (v as YTNodes.Video)?.view_count.toString() || short_view_count.toString(),
        };
      });
    const shorts = feed.videos
      .filter((v) => v.is(YTNodes.ReelItem))
      .map(({ thumbnails, title, views }) => ({ thumbnails, title: title.toString(), views: views.toString() }));

    return {vids, shorts}
  } catch (err) {
    logger.error("Get home feed err", err);
    return null;
  }
};

export { getPlaylist, getSearchSuggestions, getVideoChapters, searchVideo, getUserHomeFeed };
