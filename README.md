# VDL Tube  
  
A full-stack YouTube video downloader and streaming web application. Search for videos, preview them in a built-in player, select a format/quality, optionally clip a segment, and download video or audio.  
  
The project is split into two independently-run services:  
  
- **`frontend/`** — a Next.js (App Router) application that serves the UI, handles YouTube search/metadata/chapters via `youtubei.js`, and exposes some Node API routes.  
- **`backend/`** — a Python Flask service that performs the actual video/audio downloading and clipping using `yt-dlp` and FFmpeg, exposed as a small task-queue API.  
  
## Features  
  
- **Video & Audio Downloads** — Download YouTube videos as MP4 or extract audio as MP3/M4A at selectable quality levels.  
- **Format Selection** — Choose from available resolutions and audio bitrates before downloading.  
- **Range-Based Clipping** — Trim and download a specific segment of a video (start/end), done server-side via FFmpeg.  
- **Chapter Extraction** — Read chapter markers from long-form videos.  
- **Playlist Browsing** — Browse videos from YouTube playlists.  
- **Built-in Video Player** — Preview/stream videos in the browser.  
- **Progressive Web App (PWA)** — Installable on desktop and mobile.  
- **Responsive Design** — Works on mobile and desktop.  
  
## Architecture  
  
```  
Browser  
  │  
  ├──> Next.js frontend (app/, src/)  
  │       ├─ Server actions / API routes using youtubei.js  
  │       │     • search, search suggestions, playlists, chapters  
  │       ├─ /api/download  (Node route: proxy / FFmpeg clip / Cloudinary)  
  │       └─ /api/chapter, /api/suggestions  
  │  
  └──> Flask backend (yt-dlp)  
          ├─ POST /task            queue a download job  
          ├─ GET  /status?task_id  poll job progress  
          ├─ GET  /download/<id>   fetch the finished file  
          └─ GET  /formats?url     list available formats  
```  
  
There are two distinct download paths in the codebase:  
  
1. **`yt-dlp` path (backend)** — `ytdlpDownload()` in the frontend posts a job to the Flask backend's `/task` endpoint, polls `/status` every 2s until the job is `finished`, then downloads from `/download/<task_id>`. The backend downloads with `yt-dlp`, merges with FFmpeg, and optionally clips the result. This path is driven by `process.env.NEXT_PUBLIC_BACKEND_URL`.  
2. **Direct-URL / Node FFmpeg path** — `downloadFile()` / `getVidUrl()` resolve a direct media URL (via `src/utils/mate.ts`) and hit the Next.js `/api/download` route, which either streams the file through or, if a time range is given, clips it with `fluent-ffmpeg`, uploads to Cloudinary, and serves the result.  
  
> Note: `youtubei.js` is used **only** for search, suggestions, playlists, and chapter data — not for the actual downloads. The heavy download/format-extraction work is `yt-dlp` in the Flask backend.  
  
## Tech Stack  
  
### Frontend (`frontend/`)  
| Category | Technology |  
|---|---|  
| Framework | Next.js 16 (App Router) |  
| Language | TypeScript 5 |  
| UI | React 19, Tailwind CSS 4, Framer Motion |  
| State Management | Redux Toolkit + React Redux |  
| Data Fetching | TanStack Query v5, Axios |  
| Media Processing | FFmpeg via `fluent-ffmpeg` + `ffmpeg-static` (`ffprobe-static`) |  
| YouTube Metadata | `youtubei.js` (InnerTube API) |  
| Media Player | `react-player` |  
| Cloud Storage | Cloudinary |  
| PWA | `@ducanh2912/next-pwa`, `@khmyznikov/pwa-install` |  
| Forms | React Hook Form |  
| Misc | `get-youtube-chapters`, `jsonwebtoken`, `lowdb`, `uuid`, `react-toastify`, `nextjs-toploader`, `@vercel/analytics` |  
  
### Backend (`backend/`)  
| Category | Technology |  
|---|---|  
| Framework | Flask 3 + Flask-CORS |  
| Downloader | `yt-dlp` |  
| Media Processing | FFmpeg (via `ffmpeg-static` binary or system `ffmpeg`) |  
| Config | `python-dotenv` |  
  
## Project Structure  
  
```  
vdl-tube/  
├── frontend/                 # Next.js application  
│   ├── app/                  # App Router  
│   │   ├── api/  
│   │   │   ├── download/     # Node route: stream / clip (FFmpeg) / Cloudinary upload  
│   │   │   ├── chapter/      # Chapter data via youtubei.js  
│   │   │   └── suggestions/  # Search suggestions via youtubei.js  
│   │   ├── download/[id]/    # Download page  
│   │   ├── playlist/         # Playlist pages  
│   │   ├── query/            # Query pages  
│   │   ├── search/           # Search pages  
│   │   ├── layout.tsx  
│   │   ├── manifest.ts       # PWA manifest  
│   │   ├── page.tsx  
│   │   └── providers.tsx  
│   ├── src/  
│   │   ├── components/       # UI (home, video-player, playlist, download, search-result, etc.)  
│   │   ├── hooks/  
│   │   ├── store-slices/     # Redux slices (infoMappings, screenSize)  
│   │   ├── store.ts  
│   │   ├── types/  
│   │   └── utils/            # youtubei, downloader, downloadApi, mate, cloudinary, logger  
│   └── public/               # Static assets, PWA icons/manifest  
│  
└── backend/                  # Flask + yt-dlp download service  
    ├── app.py                # Routes: /task, /status, /download/<id>, /formats  
    ├── requirements.txt  
    └── util/  
        ├── queue.py          # DownloadQueue: yt-dlp download + FFmpeg clip  
        ├── helper.py         # Format filtering, cookie-file builder  
        └── types.py          # TypedDicts / enums for media formats & queue items  
```  
  
## Getting Started  
  
You must run **both** the frontend and the backend.  
  
### Prerequisites  
  
- Node.js 18+ and npm (or yarn)  
- Python 3.10+ and pip  
- FFmpeg available on the backend (either the bundled `ffmpeg-static` binary or a system-installed `ffmpeg`)  
  
### 1. Backend (Flask + yt-dlp)  
  
```bash  
cd backend  
python -m venv .venv  
source .venv/bin/activate          # Windows: .venv\Scripts\activate  
pip install -r requirements.txt  
python app.py  
```  
  
The backend reads a `PORT` environment variable; if unset it uses Flask's default. It runs in debug mode.  
  
### 2. Frontend (Next.js)  
  
```bash  
cd frontend  
npm install  
npm run dev  
```  
  
The app is available at `http://localhost:3000`.  
  
### Production Build (frontend)  
  
```bash  
npm run build  
npm run start  
```  
  
### Lint (frontend)  
  
```bash  
npm run lint  
```  
  
## How It Works  
  
1. **Search or Paste** — Enter a YouTube URL or search term on the home page.  
2. **Fetch Metadata** — The Next.js server layer uses `youtubei.js` (InnerTube) for search results, suggestions, playlist contents, and chapter markers.  
3. **List Formats** — The Flask `/formats` endpoint uses `yt-dlp` to extract and filter available audio/video formats.  
4. **Select Format & (optionally) a Range** — Pick a resolution or audio bitrate, and optionally a start/end to clip.  
5. **Download** — Depending on the flow:  
   - **Backend path:** the frontend queues a job (`POST /task`), polls `/status`, then downloads from `/download/<id>`. The backend runs `yt-dlp`, merges via FFmpeg, and clips with FFmpeg `-c copy` if a range was set.  
   - **Node path:** `/api/download` either proxies/streams the resolved media URL, or (for a range) clips with `fluent-ffmpeg`, uploads to Cloudinary, and serves the file.  
  
## Environment Variables  
  
### Frontend — `frontend/.env.local`  
  
```env  
# Base URL of the Flask backend (used by the yt-dlp download path)  
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000  
  
# Cloudinary (used by /api/download when clipping/uploading)  
CLOUDINARY_CLOUD_NAME=  
CLOUDINARY_API_KEY=  
CLOUDINARY_API_SECRET=  
```  
  
### Backend — `backend/.env`  
  
```env  
# Optional port for the Flask app  
PORT=  
  
# Netscape-format YouTube cookies content (written to /tmp for yt-dlp)  
COOKIES=  
```  
