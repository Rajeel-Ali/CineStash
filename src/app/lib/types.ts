export type Status = 'To Watch' | 'Started' | 'Watched' | 'Not Interested';

export type CineItemType = 'movie' | 'show';

export type CineItem = {
  id: string;
  title: string;
  year: number;
  runtime: number; // in minutes
  genres: string[];
  posterId: string; // Corresponds to an ID in placeholder-images.json
  synopsis: string;
  cast: string[];
  tmdbId: number;
  imdbId: string;
  status: Status;
  rating: number | null; // 1-10
  dateAdded: string | null;
  dateWatched: string | null;
  note: string;
  tags: string[];
  type: CineItemType;
  progress?: {
    // For movies
    percentage?: number;
    // For shows
    season?: number;
    episode?: number;
  };
};
