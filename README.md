# VDL Tube

A modern, full-stack YouTube video downloader and streaming web application. Search for videos, select your preferred format and quality, and download or clip media directly from YouTube.

## Features

- **Video & Audio Downloads** — Download YouTube videos as MP4 or extract audio as MP3 at various quality levels
- **Format Selection** — Choose from multiple resolutions and bitrates before downloading
- **Range-Based Clipping** — Trim and download specific segments of a video server-side via FFmpeg
- **Chapter Extraction** — Navigate and download individual chapters from long-form videos
- **Playlist Support** — Browse and download videos from YouTube playlists
- **Built-in Video Player** — Stream videos directly in the browser with custom controls
- **Progressive Web App (PWA)** — Installable on desktop and mobile devices
- **Responsive Design** — Optimized for both mobile and desktop

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| State Management | Redux Toolkit |
| Data Fetching | TanStack Query v5 |
| Media Processing | FFmpeg (via `fluent-ffmpeg` + `ffmpeg-static`) |
| YouTube Integration | `youtubei.js` (InnerTube API) |
| Cloud Storage | Cloudinary |
| PWA | `@ducanh2912/next-pwa` |
| Forms | React Hook Form |

## Project Structure

```
vdl-tube/
└── frontend/          # Next.js application
    ├── app/           # App Router pages and API routes
    ├── src/
    │   └── components/
    │       ├── home-components/   # Landing page, search bar
    │       ├── video/             # Video player and controls
    │       ├── playlist/          # Playlist browsing
    │       └── download/          # Format selection, range download, chapters
    └── public/        # Static assets, PWA manifest
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Maxessien/vdl-tube.git
cd vdl-tube/frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## How It Works

1. **Search or Paste** — Enter a YouTube URL or search term in the home page input.
2. **Fetch Metadata** — The app queries YouTube's InnerTube API via `youtubei.js` to retrieve video info and available formats.
3. **Select Format** — Choose a video resolution or audio bitrate from the quality selector.
4. **Download** — The `/api/download` route processes the request server-side using FFmpeg (for clipping/transcoding) and optionally uploads the result to Cloudinary before serving the download link.

## Environment Variables

Create a `.env.local` file in the `frontend/` directory and configure the following:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## License

This project is private and not licensed for public distribution.
