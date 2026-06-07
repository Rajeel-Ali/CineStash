import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// This can be used for fallback images if needed, but primary images will come from TMDB
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
