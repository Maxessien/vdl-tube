import ResultCard from "@/src/components/search-result-components/ResultCard";
import { searchVideo } from "@/src/utils/youtubei";
import { notFound } from "next/navigation";

const SearchPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query: string }>;
}) => {
  const { query } = await searchParams;
  if (!query.trim()) return notFound();
  const searchResult = await searchVideo(query);
  return (
    <>
      <section>
        <header className="w-full mb-4">
          <h2 className="text-2xl font-medium w-full text-center text-(--text-primary)">
            Search Results for: {` ${query}`}
          </h2>
        </header>

        {searchResult?.length > 0 ? (
          <ul className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl gap-3">
            {searchResult.map((result) => {
              return <ResultCard result={result} />;
            })}
          </ul>
        ) : (
          <p className="text-lg font-medium w-full text-center text-(--text-primary)">
            No Videos Found
          </p>
        )}
      </section>
    </>
  );
};

export default SearchPage;
