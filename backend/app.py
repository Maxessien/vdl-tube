from dotenv import load_dotenv

load_dotenv()

from flask_cors import CORS
from flask import jsonify, Flask, request, send_file
from os import environ
from yt_dlp import YoutubeDL

# from yt_dlp.YoutubeDL import _Params
from util.queue import download_manager
from util.types import MediaFormatList
from util.helper import filter_formats, process_formats, build_cookie_file
from uuid import uuid4
from threading import Thread


app = Flask((__name__))

CORS(app)

print(build_cookie_file())


@app.route("/task", methods=["POST"])
def queue_vid():
    body = dict(request.get_json())
    (url, start, end, format, vid_id, ext, title, type) = (
        body.get("url"),
        body.get("start"),
        body.get("end"),
        body.get("format"),
        body.get("vid_id"),
        body.get("ext"),
        body.get("title"),
        body.get("type"),
    )

    if not url or not vid_id:
        return jsonify({"data": "Url or Video id is missing"}), 400

    t_id = str(uuid4())

    download_manager.items.append(
        {
            "end": end,
            "format": format,
            "path": None,
            "progress": 0,
            "start": start,
            "status": "processing",
            "url": url,
            "vid_id": vid_id,
            "task_id": t_id,
            "ext": ext,
            "title": title,
            "type": type,
        }
    )

    if not download_manager.is_processing:
        t = Thread(target=download_manager.process_queue)
        t.start()

    return jsonify({"data": "Queued", "task_id": t_id}), 202


@app.route("/download/<id>", methods=["GET"])
def download(id: str):
    task = download_manager.find(id)

    if not task:
        return jsonify({"data": "Task not found"}), 404

    if task["status"] != "finished":
        return jsonify({"data": "Processing not finished or failed"}), 409

    if not task["path"]:
        return jsonify({"data": "File is not available"}), 409

    return (
        send_file(
            task["path"],
            f"{task['type']}/{task['ext']}",
            True,
            f"{task['title']}.{task['ext']}",
        ),
        200,
    )


@app.route("/status", methods=["GET"])
def get_status():
    params = request.args
    task_id = params.get("task_id")

    if not task_id:
        return jsonify({"data": "Task ID is missing"}), 400

    task = download_manager.find(task_id)

    if not task:
        return jsonify({"data": "Task not found"}), 404

    return (
        jsonify(
            {
                "task_id": task["task_id"],
                "status": task["status"],
                "progress": task["progress"],
            }
        ),
        200,
    )


@app.route("/formats", methods=["GET"])
def get_vid_formats():
    try:
        params = request.args
        url = params.get("url")

        if not url:
            return jsonify({"data": "Url is missing"}), 400

        opt = {
            "no_warnings": True,
            "retries": 5,
            "cookiefile": build_cookie_file(),
            "http_headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
        }

        yt = YoutubeDL(opt)
        formats: MediaFormatList = yt.extract_info(url, False)["formats"]

        audio_formats = list(
            filter(lambda format: filter_formats(format, "audio"), formats)
        )
        video_formats = list(
            filter(lambda format: filter_formats(format, "video"), formats)
        )

        return (
            jsonify(
                {
                    "audio_formats": list(
                        map(lambda f: process_formats(f, "audio"), audio_formats)
                    ),
                    "video_formats": list(
                        map(lambda f: process_formats(f, "video"), video_formats)
                    ),
                }
            ),
            200,
        )
    except Exception as err:
        print(err)
        return jsonify({"data": "Server error"}), 500


if __name__ == "__main__":
    app.run(
        "0.0.0.0",
        environ.get("PORT"),
        True,
        environ.get("PORT") and len(environ.get("PORT")) > 0,
    )
