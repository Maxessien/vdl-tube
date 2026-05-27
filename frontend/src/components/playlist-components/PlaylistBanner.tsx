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
  return (
    <div>
      <div>
        <picture>
          {thumbnails.map(({ url }) => (
            <source srcSet={url} key={url} />
          ))}
          <img
            src={thumbnails.reduce((a, b) => (a.width > b.width ? a : b)).url}
            alt="Thumbnail"
          />
        </picture>
      </div>
      <p>{title}</p>
      <p>{subtitle}</p>
      <div>
        <div>
          <picture>
            {author.thumbnails.map(({ url }) => (
              <source key={url} srcSet={url} />
            ))}
            <img
              src={
                author.thumbnails.reduce((a, b) => (a.width > b.width ? a : b))
                  .url
              }
              alt="Author thumbnail"
            />
          </picture>
        </div>
        <p>{author.name}</p>
      </div>
      <p>
        <span>{total_items}</span>
        <span>{last_updated}</span>
      </p>

      <section>
        <h2>Description</h2>
        <p>{description}</p>
      </section>
    </div>
  );
};

export default PlaylistBanner;
