import { secondsToTimestamp, timestampToSeconds } from "@/src/utils/downloader";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

const RangeDownload = ({ duration, submitFn, isPending, isActive }: { duration: number, isActive: boolean, isPending: boolean, submitFn: (start: number, end: number)=>void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { start: "00:00:00", end: secondsToTimestamp(duration) },
    mode: "onSubmit"
  });

  const submitWrapper = (data: {start: string, end: string})=>{
    const start = timestampToSeconds(data.start)
    const end = timestampToSeconds(data.end)
    return submitFn(start, end)
  }
  return (
    <section>
      <header>
        <h2 className="text-xl text-(--text-primary) my-3 w-full text-center font-semibold">
          Download By Range
        </h2>
      </header>

      <form onSubmit={handleSubmit(submitWrapper)} className="space-y-3 w-full">
        <div className="flex flex-col gap-2 w-full items-start">
          <label
            className="text-base font-medium text-(--text-primary)"
            htmlFor="start"
          ></label>
          <input
            placeholder="HH:MM:SS"
            {...register("start", {
              required: "Start is required",
              pattern: {
                value: /[0-9]{2}:[0-5][0-9]:[0-5][0-9]/,
                message: "Must match time format (HH:MM:SS)"
              },
              min: {
                value: "00:00:00",
                message: "Start cannlot be below zero seconds",
              },
              max: {
                value: secondsToTimestamp(duration - 5),
                message: "Start cannot be higher than video duration",
              },
            })}
            className="text-(--text-primary) w-full max-w-xs font-medium text-[15px] px-3 py-2 rounded-md border-2 border-(--text-primary-light) bg-(--main-secondary-light)"
            id="start"
            type="text"
          />
          {errors?.start && (
            <p className="font-medium text-sm text-red-600">
              {errors?.start.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full items-start">
          <label
            className="text-base font-medium text-(--text-primary)"
            htmlFor="end"
          ></label>
          <input
            placeholder="HH:MM:SS"
            {...register("end", {
              required: "Start is required",
              pattern: {
                value: /[0-9]{2}:[0-5][0-9]:[0-5][0-9]/,
                message: "Must match time format (HH:MM:SS)"
              },
              min: {
                value: "00:00:05",
                message: "End cannlot be below 5 seconds",
              },
              max: {
                value: secondsToTimestamp(duration),
                message: "End cannot be higher than video duration",
              },
            })}
            className="text-(--text-primary) w-full max-w-xs font-medium text-[15px] px-3 py-2 rounded-md border-2 border-(--text-primary-light) bg-(--main-secondary-light)"
            id="end"
            type="text"
          />
          {errors?.end && (
            <p className="font-medium text-sm text-red-600">
              {errors?.end.message}
            </p>
          )}
        </div>
        <button
          disabled={isPending || isActive}
          className="flex disabled:opacity-75 py-3 px-4 w-full justify-center items-center text-xl text-(--text-primary) not-visited:rounded-full bg-(--main-primary) font-semibold"
        >
          {isActive ? (
            <>
              <span className="sr-only">Downloading range</span>
              <FaSpinner className="text-3xl animate-spin" />
            </>
          ) : (
            "Download Range"
          )}
        </button>
      </form>
    </section>
  );
};

export default RangeDownload;
