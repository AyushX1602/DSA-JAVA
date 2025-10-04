import { useState, useEffect } from 'react';
import ImageCard from '@/components/ui/image-card';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop';

const TripImageCarousel = ({ placeImages, tripName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);

  useEffect(() => {
    if (placeImages && placeImages.length > 0) {
      const images = placeImages.flatMap((place) => place.images);
      setAllImages(images);
    }
  }, [placeImages]);

  useEffect(() => {
    if (allImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allImages]);

  if (allImages.length === 0) {
    return (
      <div className="relative h-full w-[520px]">
        <ImageCard
          imageUrl={FALLBACK_IMG}
          caption={tripName || 'Trip Images'}
          className="h-full"
          fallbackUrl={FALLBACK_IMG}
        />
      </div>
    );
  }

  const currentImage = allImages[currentImageIndex];

  return (
    <div className="relative h-full w-[520px]">
      <ImageCard
        key={currentImage}
        imageUrl={currentImage}
        caption={tripName || 'Trip Images'}
        className="h-full"
        fallbackUrl={FALLBACK_IMG}
      />
    </div>
  );
};

export default TripImageCarousel;
