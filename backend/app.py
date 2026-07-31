from flask_cors import CORS
from flask import jsonify, Flask, request
from os import environ
from yt_dlp import YoutubeDL

app = Flask()

CORS(app)

app.route("/download", ["GET"])


def download_vid():
    params = request.args
    (url, start, end) = (params.get("url"), params.get("start"), params.get("end"))

    if not url:
        return jsonify({"data": "Url is missing"}), 400
    yt = YoutubeDL()

    yt.download([url])


if app.name == "__main__":
    app.run("0.0.0.0", environ.get("PORT"), True, len(environ.get("PORT")) > 0)
