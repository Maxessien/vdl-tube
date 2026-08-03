from flask_cors import CORS
from flask import jsonify, Flask, request
from os import environ
from yt_dlp import YoutubeDL
from yt_dlp.YoutubeDL import _Params
from util.queue import download_manager


app = Flask()

CORS(app)


@app.route("/task", ["POST"])
def queue_vid():
    body = dict(request.get_json())
    (url, start, end, format, vid_id) = (
        body.get("url"),
        body.get("start"),
        body.get("end"),
        body.get("format_id"),
        body.get("vid_id"),
    )

    if not url or not vid_id:
        return jsonify({"data": "Url or Video id is missing"}), 400

    download_manager.items.append(
        {
            "end": end,
            "format": format,
            "path": None,
            "progess": 0,
            "start": start,
            "status": "processing",
            "url": url,
            "vid_id": vid_id,
        }
    )

    if not download_manager.is_processing: download_manager.process_queue()

    return jsonify({"data": "Queued"}), 202

@app.route("/formats", methods=["GET"])
def get_vid_formats():
    try:
        params = request.args
        url = params.get("url")

        if not url:
            return jsonify({"data": "Url is missing"}), 400

        opt: _Params = {"no_warnings": True, "retries": 5}

        yt = YoutubeDL(opt)
        return jsonify(yt.extract_info(url, False)["formats"]), 200
    except:
        return jsonify({"data": "Server error"}), 500


if app.name == "__main__":
    app.run("0.0.0.0", environ.get("PORT"), True, len(environ.get("PORT")) > 0)
