export type Movie = {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  duration: number;
  year: number;
  cast: string;
  trailerUrl: string;
  posterUrl: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MovieInput = Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>;

export type MovieHighlight = Movie & {
  scheduleDate: string;
  scheduleTime?: string | null;
};

