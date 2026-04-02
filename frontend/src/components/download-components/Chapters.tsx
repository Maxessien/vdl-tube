import LoadRoller from "@/src/components/reusable-components/LoadRoller";
import { secondsToTimestamp } from "@/src/utils/downloader";
import { Chapter } from "get-youtube-chapters";

// export interface Chapter {
//   title: string;
//   time: string;
//   url: string;
// }

const Chapters = ({
  chapters,
  downloadFn,
  isPending,
  isActive,
}: {
  chapters: { isLoading: boolean; data: Chapter[] };
  downloadFn: (
    type: string,
    start: number,
    title: string,
    end?: number,
  ) => void;
  isPending: boolean;
  isActive: (type: string) => boolean;
}) => {

  return (
    <section className="w-full">
      <header>
        <h2 className="text-xl text-(--text-primary) my-3 w-full text-center font-semibold">
          Chapters
        </h2>
      </header>
      {!chapters?.isLoading ? (
        chapters?.data?.length > 0 ? (
          <ul>
            {chapters?.data?.map(({ title, start }, index) => {
              return (
                <li
                  key={index}
                  className="w-full flex justify-between items-center px-3 py-5 space-y-3 text-left rounded-md bg-(--main-secondary-light) shadow-md shadow-gray-700"
                >
                  <div className="flex flex-col gap-2 flex-1 items-start">
                    <span className="text-lg w-full wrap-break-word font-medium text-(--text-primary)">
                      {title}
                    </span>
                    <span className="text-base font-medium text-(--text-primary-light)">
                      {secondsToTimestamp(start)}
                      {chapters?.[index + 1]?.start
                        ? ` - ${secondsToTimestamp(chapters?.[index + 1]?.start)}`
                        : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      console.log(start, title, chapters?.[index + 1]?.start);
                      return downloadFn(
                        `chapter-${index}`,
                        start,
                        title,
                        chapters?.[index + 1]?.start
                          ? chapters[index + 1].start
                          : undefined,
                      );
                    }}
                    disabled={isPending || isActive(`chapter-${index}`)}
                    className="flex disabled:opacity-75 py-2 px-4 justify-center items-center text-base text-(--text-primary) not-visited:rounded-full bg-(--main-primary) font-semibold"
                  >
                    {isActive(`chapter-${index}`) ? (
                      <>
                        <span className="sr-only">Downloading chapter</span>
                        <LoadRoller size={20} duration={0.7} />
                      </>
                    ) : (
                      "Download"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-lg w-full text-center font-medium text-(--text-primary)">
            No Chapters found
          </p>
        )
      ) : (
        <div className="w-full py-6 flex justify-center text-(--text-primary) items-center">
          <span className="sr-only">Loading chapters</span>
          <LoadRoller size={30} duration={0.7} />
        </div>
      )}
    </section>
  );
};

export default Chapters;
