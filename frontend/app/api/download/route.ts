import { uploader } from "@/src/utils/cloudinary";
import {
  parseTimeParam,
  resolveFfmpegBinaryPath,
} from "@/src/utils/downloadApi";
import logger from "@/src/utils/logger";
import { UploadApiResponse } from "cloudinary";
import ffmpeg from "fluent-ffmpeg";


export const runtime = "nodejs";

const resolvedFfmpegPath = resolveFfmpegBinaryPath();

if (resolvedFfmpegPath) ffmpeg.setFfmpegPath(resolvedFfmpegPath);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");
  const fileType = searchParams.get("type") as "audio" | "video";
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const stream = searchParams.get("stream");
  const startTime = parseTimeParam(start);
  const endTime = parseTimeParam(end);
  const hasStart = startTime !== null;
  const hasEnd = endTime !== null && endTime > startTime;

  if (!videoUrl) return new Response("Missing URL", { status: 400 });

  // Return video immediately from url if no range was specified
  if (!hasStart) {
    const range = request.headers.get("range");
    const headers = {};
    if (range) headers["Range"] = range;
    const res = await fetch(videoUrl, { headers });
    return new Response(res.body, {
      headers: {
        "Content-Type": fileType === "audio" ? "audio/mp3" : "video/mp4",
        "Content-Length": res.headers.get("Content-Length") || "",
        ...(!stream?.trim()
          ? { "Content-Disposition": `attachment;"` }
          : {
              "Content-Range": res.headers.get("Content-Range") || "",
              "Accept-Ranges": res.headers.get("Accept-Ranges") || "",
            }),
      },
      status: stream?.trim() ? 206 : 200,
    });
  }

  if (!resolvedFfmpegPath)
    return new Response("FFmpeg binary could not be resolved on server", {
      status: 500,
    });

  const command = ffmpeg(videoUrl)
    .videoCodec("copy")
    .audioCodec("copy")
    .format(fileType === "audio" ? "mp3" : "mp4")
    .setStartTime(startTime)
    .outputOptions("-movflags frag_keyframe+empty_moov");

  if (hasEnd) command.duration(endTime - startTime);

  const cloudinaryRes: UploadApiResponse = await new Promise(
    (resolve, reject) => {
      const stream = uploader.upload_stream(
        { folder: "/vdl-tube", resource_type: fileType === "audio" ? "auto" : "video" },
        (err, result) => {
          if (err) {
            logger.error("Cloudnary upload err", err);
            return reject(err);
          }
          resolve(result);
        },
      );

      command.pipe(stream);
    },
  );

  const res = await fetch(cloudinaryRes.secure_url);

  return new Response(res.body, {
    headers: {
      "Content-Type": fileType === "audio" ? "audio/mp3" : "video/mp4",
      "Content-Length": res.headers.get("Content-Length"),
      "Content-Disposition": `attachment;"`,
    },
  });
}
