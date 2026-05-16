import SearchResults from "@/src/components/search-result-components/SearchResults";
import {
  SerializedPlaylistResult,
  SerializedVideoResult,
} from "@/src/types/matesTypes";
import { searchVideo } from "@/src/utils/youtubei";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { YTNodes } from "youtubei.js";

export const metadata: Metadata = {
  title: "VDL Tube - Search",
};

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query: string }>;
}) => {
  const { query } = await searchParams;
  if (!query.trim()) return notFound();
  const searchResult = await searchVideo(query);
  const videos = searchResult?.videos?.filter(
    (item) => item.is(YTNodes.Video) || item.is(YTNodes.CompactVideo),
  );
  const playlists = searchResult?.playlists?.filter(
    (p) => p.is(YTNodes.Playlist) || p.is(YTNodes.GridPlaylist),
  );

  // Serialize videos to plain objects for Client Component
  const serializedVideos: SerializedVideoResult[] = videos?.map((vids) => ({
    video_id: vids.video_id,
    title: vids.title.toString(),
    view_count: vids.view_count?.toString() || "0",
    best_thumbnail: {
      url: vids.best_thumbnail?.url || "",
    },
    thumbnails: vids.thumbnails.sort((a, b)=> a.width - b.width),
    author: {
      name: vids.author?.name || "",
      best_thumbnail: {
        url: vids.author?.best_thumbnail?.url || "",
      },
    },
  }));

  // Serialize playlists to plain objects for Client Component
  const serializedPlaylists: SerializedPlaylistResult[] = playlists?.map(
    (playlist: any) => {
      let authorName = "Unknown";
      let authorThumbnail = undefined;
      if (playlist.author) {
        if (typeof playlist.author === "string") {
          authorName = playlist.author;
        } else if (typeof playlist.author === "object") {
          authorName = playlist.author.name || playlist.author.toString() || "Unknown";
          authorThumbnail = playlist.author.best_thumbnail?.url;
        }
      }
      return {
        id: playlist.id,
        author: authorName,
        authorThumbnail,
        thumbnails: playlist.thumbnails || [],
      };
    }
  );

  return (
    <>
      <section>
        <header className="w-full mb-4">
          <h2 className="text-2xl font-medium w-full text-center text-(--text-primary)">
            Search Results for: {` ${query}`}
          </h2>
        </header>

        <SearchResults
          playlists={serializedPlaylists}
          videos={serializedVideos}
        />
      </section>
    </>
  );
};

export default SearchPage;
