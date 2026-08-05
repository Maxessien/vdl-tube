from util.types import MediaFormat


def filter_formats(f: MediaFormat, type: str):
    if type == "audio":
        return (
            f["audio_ext"] != "none"
            and f["format_id"]
            and (f.get("filesize") or f.get("filesize_approx"))
            and (f.get("abr") and f.get("abr") > 0)
            and not f.get("has_drm")
        )
    elif type == "video":
        return (
            f["video_ext"] != "none"
            and f["format_id"]
            and (f.get("filesize") or f.get("filesize_approx"))
            and f.get("ext") != "mhtml"
            and f.get("resolution") != "audio only"
            and parse_resolution(f.get("resolution"))
            and not f.get("has_drm")
        )
    else:
        return False


def process_formats(f: MediaFormat, type: str) -> MediaFormat:
    format = {
        "ext": f.get("ext"),
        "filesize": f.get("filesize"),
        "filesize_approx": f.get("filesize_approx"),
        "format_id": f.get("format_id"),
        "url": f.get("url"),
    }
    if type == "video":
        format["resolution"] = parse_resolution(f.get("resolution") or "")
    if type == "audio": format["resolution"] = f.get("abr")
    return format


def parse_resolution(r: str):
    spl = r.split("x")
    return spl[1] if len(spl) == 2 else None
