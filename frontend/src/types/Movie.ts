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
};

export type MovieInput = Omit<Movie, 'id'>;

