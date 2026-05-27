import { PlaylistInfo } from "@/src/types/matesTypes";

const PlaylistBanner = ({ info }: { info: PlaylistInfo }) => {
  const {
    author,
    last_updated,
    subtitle,
    thumbnails,
    total_items,
    description,
    title,
  } = info;

  const mainThumbnail = thumbnails.reduce((a, b) => (a.width > b.width ? a : b)).url;

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-linear-to-b from-(--main-primary) to-(--main-secondary-light) flex flex-col h-full shadow-xl border border-(--main-secondary-light)">
      {/* Immersive blurred background effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-2xl scale-125 pointer-events-none"
        style={{ backgroundImage: `url(${mainThumbnail})` }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Main Playlist Banner Artwork */}
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg group relative mb-5 border border-white/10">
          <picture>
            {thumbnails.map(({ url }) => (
              <source srcSet={url} key={url} />
            ))}
            <img
              src={mainThumbnail}
              alt="Thumbnail"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </picture>
        </div>

        {/* Playlist Details */}
        <h1 className="text-2xl font-bold tracking-tight mb-2 line-clamp-2 text-(--text-primary)">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-sm font-medium text-(--main-primary-light) mb-4">
            {subtitle}
          </p>
        )}

        {/* Creator Channel Reference */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10">
            <picture>
              {author.thumbnails.map(({ url }) => (
                <source key={url} srcSet={url} />
              ))}
              <img
                src={author.thumbnails.reduce((a, b) => (a.width > b.width ? a : b)).url}
                alt="Author thumbnail"
                className="w-full h-full object-cover"
              />
            </picture>
          </div>
          <p className="font-semibold text-sm hover:text-white cursor-pointer transition-colors line-clamp-1">
            {author.name}
          </p>
        </div>

        {/* Meta Indicators */}
        <div className="flex items-center gap-2 text-xs text-(--text-primary-light) font-medium mb-6">
          <span>{total_items} videos</span>
          <span className="before:content-['•'] before:mr-2">{last_updated}</span>
        </div>

        {/* Expandable Scrollable Description Container */}
        {description && (
          <section className="mt-auto bg-black/20 rounded-xl p-3.5 border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
            <h2 className="text-xs uppercase tracking-wider font-bold text-(--text-primary-light) mb-1">
              Description
            </h2>
            <p className="text-xs text-(--text-primary-light) leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default PlaylistBanner;
