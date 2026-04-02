"use client"

import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { addInfo } from "../store-slices/infoMappingsSlice";
import logger from "../utils/logger";
import { getVideoInfo } from "../utils/mate";

const useSearch = () => {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const search = async (search: string): Promise<void> => {
    try {
      setIsFetching(true);
      if (search.trim().length <= 0) {
        return undefined;
      }

      const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;
      const isUrl = youtubeUrlRegex.test(search);
      if (isUrl) {
        const urlId = v4();
        const info = await getVideoInfo(search);
        dispatch(addInfo({ key: urlId, info: info }));
        router.push(`/download/${urlId}?id=${info.id}`);
      } else router.push(`/search?query=${search}`);
    } catch (err) {
      logger.error("Error searching", err);
      toast.error("There was an error searching for video");
      throw err;
    } finally {
      setIsFetching(false);
    }
  };

  return {isFetching, search}
};

export default useSearch
