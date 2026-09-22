const FormatsHeaders = ({
  format,
  setFormat,
  vidTitle,
}: {
  vidTitle: string;
  setFormat: (format: "video" | "audio") => void;
  format: "video" | "audio";
}) => {
  return (
    <>
      <h1 className="text-2xl text-(--text-primary) my-3 w-full text-center font-semibold">
        {vidTitle}
      </h1>

      <div className="flex mb-3 w-full items-end">
        <button
          onClick={() => setFormat("video")}
          className={`flex-1 ${format === "video" ? "border-b-2 border-b-(--main-primary)" : ""} hover:bg-(--main-secondary-light) font-semibold px-2 py-3 text-(--text-primary) text-xl`}
        >
          Video
        </button>
        <button
          onClick={() => setFormat("audio")}
          className={`flex-1 ${format === "audio" ? "border-b-2 border-b-(--main-primary)" : ""} hover:bg-(--main-secondary-light) font-semibold px-2 py-3 text-(--text-primary) text-xl`}
        >
          Audio
        </button>
      </div>
    </>
  );
};

export default FormatsHeaders;
