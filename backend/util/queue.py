from os import curdir
from uuid import uuid4
from pathlib import Path

# from yt_dlp.YoutubeDL import _Params
from yt_dlp import YoutubeDL
from pathlib import Path
from util.types import QueueItem
import subprocess

FFMPEG_LOCATION = ""


class DownloadQueue:
    is_processing: bool
    items: list[QueueItem]
    popped: list[QueueItem]

    def __init__(self, init_items: list = []):
        self.items = init_items
        self.is_processing = False
        self.popped = []

    def __clip_vid(self, itm: QueueItem):
        if not itm["start"] and not itm["end"]:
            return

        path = Path(itm["path"])
        new_path = f"{str(path).replace(path.suffix, f"_trimmed{path.suffix}")}"

        if not path.exists() or not path.is_file():
            return

        default_arg = [
            FFMPEG_LOCATION,
            "-ss",
            (str(itm["start"]) if itm["start"] else "0"),
            "-i",
            itm["path"],
        ]

        if itm["end"]:
            default_arg += ["-t", itm["end"]]

        default_arg += ["-c", "copy", new_path]

        proc = subprocess.Popen(default_arg)

        val = proc.wait()

        if val == 0:
            self.__cleanup(itm["path"])
            itm["path"] = new_path

    def __calculate_progress(self, d: dict) -> float:
        if d["status"] != "downloading":
            return 100.0

        # Strategy 1: Check by raw file bytes (most common)
        total_bytes = d.get("total_bytes") or d.get("total_bytes_estimate")
        downloaded_bytes = d.get("downloaded_bytes", 0)

        if total_bytes and total_bytes > 0:
            return round((downloaded_bytes / total_bytes) * 100, 2)

        # Strategy 2: Fall back to streaming fragments (HLS/DASH)
        fragment_index = d.get("fragment_index")
        fragment_count = d.get("fragment_count")

        if fragment_index and fragment_count:
            return round((fragment_index / fragment_count) * 100, 2)

        # Strategy 3: Indeterminate progress (size cannot be determined)
        return 0.0

    def __save_processed(self, itm: QueueItem):
        # TODO
        pass

    def __cleanup(self, path: str):
        # TODO
        pass

    def __save_prog(self, itm: QueueItem, val: int):
        itm["progress"] = self.__calculate_progress(val)

    def process_queue(self):
        if self.is_processing or len(self.items) == 0:
            return
        self.is_processing = True
        itm = self.items.pop(0)

        self.popped.append(itm)

        filename = str(uuid4())

        output_path = f"{curdir}/uploads/{filename}.{itm["ext"]}"

        opts = {
            "format": itm["format"] if itm["format"] else "bv*+ba/b",
            "ffmpeg_location": FFMPEG_LOCATION,
            "no_warnings": True,
            "outtmpl": f"{output_path}",
            "progress_hooks": [lambda val: self.__save_prog(itm, val)],
        }

        yt = YoutubeDL(opts)

        yt.download([itm["url"]])
        itm["path"] = output_path

        itm["status"] = "finished"

        self.__clip_vid(itm)
        self.__save_processed(itm)

        if len(self.items) == 0:
            self.is_processing = False
            return
        else:
            return self.process_queue()

    def find(self, f_id: str, type: str = "all", field: str = "task_id"):
        if type == "processing":
            source = self.items
        elif type == "popped":
            source = self.popped
        else:
            source = [*self.popped, *self.items]

        for itm in source:
            if itm.get(field) and f_id == itm.get(field):
                return itm

        return None

download_manager = DownloadQueue()
