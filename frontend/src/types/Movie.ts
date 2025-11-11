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
<<<<<<< HEAD
};

export type MovieInput = Omit<Movie, 'id'>;
=======
  createdAt?: string;
  updatedAt?: string;
};

export type MovieInput = Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>;

export type MovieHighlight = Movie & {
  scheduleDate: string;
  scheduleTime?: string | null;
};
>>>>>>> 81156c2 (1 er modification)

