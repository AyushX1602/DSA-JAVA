import { useTripImages } from '@/hooks/react-query/use-ai-trip-generation';
import ImageCard from '@/components/ui/image-card';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop'; // generic travel image

const TripCoverImage = ({ tripId, className = '' }) => {
  const { data, isLoading } = useTripImages(tripId, {
    staleTime: 5 * 60 * 1000,
  });

  // Find the first available image
  const coverUrl = Array.isArray(data)
    ? data.find((p) => Array.isArray(p.images) && p.images.length > 0)
        ?.images?.[0] || null
    : null;

  if (isLoading) {
    return (
      <div
        className={`w-full aspect-video rounded-base border-2 border-border bg-muted animate-pulse ${className}`}
      />
    );
  }

  return (
    <ImageCard
      imageUrl={coverUrl || FALLBACK_IMG}
      caption={null}
      className={className}
      aspectClassName="aspect-video"
      fallbackUrl={FALLBACK_IMG}
    />
  );
};

export default TripCoverImage;
