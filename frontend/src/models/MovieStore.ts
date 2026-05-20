import { types, flow, cast } from 'mobx-state-tree';
import client from '../api/client';
import { Movie, MovieInput, Rating } from '../types';

const MovieModel = types.model('Movie', {
  id:         types.identifierNumber,
  title:      types.string,
  year:       types.number,
  rating:     types.enumeration<Rating>('Rating', ['G', 'PG', 'M', 'MA', 'R']),
  created_at: types.string,
  updated_at: types.string,
});

const MovieStore = types
  .model('MovieStore', {
    movies:       types.array(MovieModel),
    status:       types.enumeration('Status', ['idle', 'loading', 'error']),
    error:        types.maybeNull(types.string),
    searchQuery:  types.optional(types.string, ''),
    ratingFilter: types.optional(types.string, ''),
  })
  .views((self) => ({
    get sortedMovies() {
      return self.movies.slice().sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    get filteredMovies() {
      const q = self.searchQuery.trim().toLowerCase();
      const r = self.ratingFilter;
      return self.movies
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .filter((m) => {
          const matchesTitle = !q || m.title.toLowerCase().includes(q) || String(m.year).includes(q);
          const matchesRating = !r || m.rating === r;
          return matchesTitle && matchesRating;
        });
    },
  }))
  .actions((self) => ({
    setSearchQuery(q: string) { self.searchQuery = q; },
    setRatingFilter(r: string) { self.ratingFilter = r; },
    fetchMovies: flow(function* () {
      self.status = 'loading';
      self.error  = null;
      try {
        const res = yield client.get<Movie[]>('/movies');
        self.movies = cast(res.data);
        self.status = 'idle';
      } catch (err: unknown) {
        self.status = 'error';
        self.error  = extractMessage(err);
      }
    }),

    createMovie: flow(function* (input: MovieInput) {
      const res = yield client.post<Movie>('/movies', input);
      self.movies.push(cast(res.data));
    }),

    updateMovie: flow(function* (id: number, input: MovieInput) {
      const res = yield client.put<Movie>(`/movies/${id}`, input);
      const idx = self.movies.findIndex((m) => m.id === id);
      if (idx !== -1) self.movies[idx] = cast(res.data);
    }),

    deleteMovie: flow(function* (id: number) {
      yield client.delete(`/movies/${id}`);
      const idx = self.movies.findIndex((m) => m.id === id);
      if (idx !== -1) self.movies.splice(idx, 1);
    }),
  }));

function extractMessage(err: unknown): string {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err &&
    typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return 'An unexpected error occurred';
}

export type MovieStoreType = typeof MovieStore.Type;
export { MovieModel };
export default MovieStore;
