from typing import TypedDict, List, Optional, Dict
from typing import TypedDict, Union, NotRequired
from enum import Enum


class AudioCodec(str, Enum):
    NONE = "none"
    MP4A_40_5 = "mp4a.40.5"
    MP4A_40_2 = "mp4a.40.2"
    OPUS = "opus"

class VideoCodec(str, Enum):
    NONE = "none"
    AVC1_4D400C = "avc1.4d400c"
    AVC1_4D4015 = "avc1.4d4015"
    VP9 = "vp9"
    AV01_0_00M_08 = "av01.0.00M.08"

class Ext(str, Enum):
    MHTML = "mhtml"
    M4A = "m4a"
    WEBM = "webm"
    MP4 = "mp4"

class AudioExt(str, Enum):
    NONE = "none"
    M4A = "m4a"
    WEBM = "webm"

class VideoExt(str, Enum):
    NONE = "none"
    MP4 = "mp4"
    WEBM = "webm"

class Protocol(str, Enum):
    MHTML = "mhtml"
    HTTPS = "https"

class Container(str, Enum):
    M4A_DASH = "m4a_dash"
    WEBM_DASH = "webm_dash"
    MP4_DASH = "mp4_dash"

class DynamicRange(str, Enum):
    SDR = "SDR"

class Fragment(TypedDict):
    duration: float
    url: str

class DownloaderOptions(TypedDict):
    http_chunk_size: int

class HttpHeaders(TypedDict):
    Accept: str
    Accept_Language: NotRequired[str] # Note: Python dict keys allow hyphens, but standard TypedDict definitions prefer mapping for hyphenated names or using dict unpacking.
    Sec_Fetch_Mode: NotRequired[str]
    User_Agent: NotRequired[str]

class MediaFormat(TypedDict):
    abr: float
    acodec: AudioCodec
    aspect_ratio: Optional[float]
    audio_ext: AudioExt
    ext: Ext
    filesize_approx: Optional[int]
    format: str
    format_id: str
    format_note: str
    fps: Optional[float]
    height: Optional[int]
    http_headers: Dict[str, str]  # Used Dict[str, str] due to hyphenated keys like "Accept-Language"
    protocol: Protocol
    resolution: str
    tbr: Optional[float]
    url: str
    vbr: float
    vcodec: VideoCodec
    video_ext: VideoExt
    width: Optional[int]
    
    # Optional/Conditional Fields (Not present in all dictionaries)
    columns: NotRequired[int]
    rows: NotRequired[int]
    fragments: NotRequired[List[Fragment]]
    asr: NotRequired[Optional[int]]
    audio_channels: NotRequired[Optional[int]]
    available_at: NotRequired[int]
    container: NotRequired[Container]
    downloader_options: NotRequired[DownloaderOptions]
    dynamic_range: NotRequired[Optional[DynamicRange]]
    filesize: NotRequired[int]
    has_drm: NotRequired[bool]
    language: NotRequired[Optional[str]]
    language_preference: NotRequired[int]
    preference: NotRequired[Optional[int]]
    quality: NotRequired[float]
    source_preference: NotRequired[int]

# Example usage for the root list:
MediaFormatList = List[MediaFormat]


class QueueItem(TypedDict):
    vid_id: str
    status: str
    url: str
    progress: int
    format: Union[str, int, None]
    path: Union[str, None]
    start: Union[int, None]
    end: Union[int, None]
    task_id: str
    ext: Ext
    title: str
    type: str