import { FaSpinner } from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import {motion} from "framer-motion"

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

export const FormatLoading = () => {
  return (
    <div className="w-full min-h-62.5 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-(--text-primary) opacity-10 animate-ping" />
        {/* Main Spinner */}
        <FaSpinner className="animate-spin text-(--text-primary) relative z-10" size={44} />
      </div>
      <p className="text-sm font-medium text-zinc-400 animate-pulse">
        Fetching available formats...
      </p>
    </div>
  );
};

export const ServerLoadingError = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto my-6 p-6 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm text-center flex flex-col items-center justify-center gap-4"
    >
      <div className="p-3 bg-red-500/10 rounded-full text-red-500">
        <MdErrorOutline size={36} />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-semibold text-zinc-100 text-base">
          Connection Failed
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-70">
          Couldn't load the server. Please check your connection or switch servers.
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
        >
          Try Another Server
        </button>
      )}
    </motion.div>
  );
};