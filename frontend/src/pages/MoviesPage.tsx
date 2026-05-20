import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../models/StoreContext';
import MovieTable from '../components/MovieTable';
import MovieForm from '../components/MovieForm';
import Select from '../components/Select';
import { MovieInput, RATINGS } from '../types';

const RATING_OPTIONS = [
  { value: '', label: 'All ratings' },
  ...RATINGS.map((r) => ({ value: r, label: r })),
];

export default observer(function MoviesPage() {
  const { movies: movieStore } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    movieStore.fetchMovies();
  }, [movieStore]);

  async function handleCreate(input: MovieInput) {
    await movieStore.createMovie(input);
    setShowAdd(false);
  }

  const total    = movieStore.movies.length;
  const filtered = movieStore.filteredMovies.length;
  const hasFilter = movieStore.searchQuery || movieStore.ratingFilter;

  return (
    <main className="movies-page">
      <div className="page-header">
        <h2>Movies</h2>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Movie
        </button>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search by title or year…"
          value={movieStore.searchQuery}
          onChange={(e) => movieStore.setSearchQuery(e.target.value)}
          className="search-input"
        />
        <Select
          value={movieStore.ratingFilter}
          onChange={(v) => movieStore.setRatingFilter(v)}
          options={RATING_OPTIONS}
          placeholder="All ratings"
        />
        {hasFilter && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { movieStore.setSearchQuery(''); movieStore.setRatingFilter(''); }}
          >
            Clear
          </button>
        )}
        {hasFilter && (
          <span className="search-count">{filtered} of {total}</span>
        )}
      </div>

      <MovieTable />

      {showAdd && (
        <MovieForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </main>
  );
});
