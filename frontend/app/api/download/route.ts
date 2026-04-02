import { uploader } from "@/src/utils/cloudinary";
import logger from "@/src/utils/logger";
import { UploadApiResponse } from "cloudinary";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";

function resolveFfmpegBinaryPath(): string | null {
  const candidates = [
    ffmpegPath,
    path.join(
      process.cwd(),
      "node_modules",
      "ffmpeg-static",
      process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg",
    ),
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string" || candidate.length === 0) {
      continue;
    }

    const normalizedPath = path.normalize(candidate);
    if (existsSync(normalizedPath)) {
      return normalizedPath;
    }
  }

  return null;
}

const resolvedFfmpegPath = resolveFfmpegBinaryPath();
logger.log("resolved", resolvedFfmpegPath);
if (resolvedFfmpegPath) {
  ffmpeg.setFfmpegPath(resolvedFfmpegPath);
}

function parseTimeParam(value: string | null): number | null {
  if (value == null) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const startTime = parseTimeParam(start);
  const endTime = parseTimeParam(end);
  const hasStart = startTime !== null;
  const hasEnd = endTime !== null && endTime > startTime;

  logger.info("time", { startTime, endTime, end, start, videoUrl });

  if (!videoUrl) return new Response("Missing URL", { status: 400 });

  // Return video immediately from url if no range was specified
  if (!hasStart) {
    const res = await fetch(videoUrl);
    return new Response(res.body, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment;"`,
        "Content-Length": res.headers.get("Content-Length"),
      },
    });
  }

  if (!resolvedFfmpegPath) {
    return new Response("FFmpeg binary could not be resolved on server", {
      status: 500,
    });
  }
  if (request.signal.aborted) {
    return new Response("Request aborted", { status: 499 });
  }

  const command = ffmpeg(videoUrl)
    .videoCodec("copy")
    .audioCodec("copy")
    .format("mp4")
    .setStartTime(startTime)
    .outputOptions("-movflags frag_keyframe+empty_moov");

  if (hasEnd) {
    command.duration(endTime - startTime);
  }

  const cloudinaryRes: UploadApiResponse = await new Promise(
    (resolve, reject) => {
      const stream = uploader.upload_stream(
        { folder: "/vdl-tube", resource_type: "video" },
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
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment;"`,
      "Content-Length": res.headers.get("Content-Length"),
    },
  });
}
