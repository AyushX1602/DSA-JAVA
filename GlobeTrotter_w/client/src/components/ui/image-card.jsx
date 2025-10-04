import { cn } from '@/lib/utils';

export default function ImageCard({
  imageUrl,
  caption,
  className,
  aspectClassName = 'aspect-[4/3]',
  imgClassName,
  fallbackUrl,
}) {
  const handleError = (e) => {
    if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
      e.currentTarget.src = fallbackUrl;
    }
  };

  return (
    <figure
      className={cn(
        'w-full overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow',
        className,
      )}
    >
      <img
        className={cn('w-full object-cover', aspectClassName, imgClassName)}
        src={imageUrl}
        alt={caption || 'image'}
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
      {caption && (
        <figcaption className="border-t-2 text-main-foreground border-border p-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
