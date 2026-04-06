import { UrlInfo } from "../download-components/VideoFormats";
import { VideoState } from "./VideoPlayer";

const VideoSettings = ({
  urls,
  videoState,
  changeSelected,
}: {
  urls: UrlInfo[];
  changeSelected: (id: string) => void;
  videoState: VideoState;
}) => {
  return (
    <div className="px-3 py-2 rounded-md border-2 border-(--text-primary-light) space-y-3 bg-(--main-secondary) text-(--text-primary)">
      <div className="w-full space-y-2">
        <h3 className="w-full text-base font-medium text-left">Quality</h3>
        <select
          className="w-max px-3 py-2 block text-sm shadow-[inset_0px_0px_10px_-6px_var(--text-primary-light)] rounded-md"
          onChange={(e) => changeSelected(e.target.value)}
          value={videoState.selectedQuality}
          name="quality"
          id="quality_select"
        >          {urls.map(({ id, quality }) => (
            <option
              className="text-(--main-secondary)"
              value={id}
              key={id}
            >{`${quality}P`}</option>
          ))}
        </select>      </div>
    </div>
  );
};

export default VideoSettings;
