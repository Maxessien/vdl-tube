export class YouTubeToolkitError extends Error {
  readonly limitReached: boolean;
  constructor(message: string, limitReached = false) {
    super(message);
    this.name = "YouTubeToolkitError";
    this.limitReached = limitReached;
  }
}
