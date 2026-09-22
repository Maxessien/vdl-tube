export class YouTubeToolkitError extends Error {
  readonly limitReached: boolean;
  constructor(message: string, limitReached = false) {
    super(message);
    this.name = "YouTubeToolkitError";
    this.limitReached = limitReached;
  }
}


/** Extract the 11-character video id from any common YouTube URL form. */
export function extractVideoId(input: string): string | null {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}