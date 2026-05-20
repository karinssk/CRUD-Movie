import { memo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Movie, MovieInput } from '../types';
import { useStore } from '../models/StoreContext';
import MovieForm from './MovieForm';
import ConfirmModal from './ConfirmModal';

const RATING_LABELS: Record<string, string> = {
  G:  'G — General',
  PG: 'PG — Parental Guidance',
  M:  'M — Mature',
  MA: 'MA — Mature Accompanied',
  R:  'R — Restricted',
};

const MovieRow = memo(function MovieRow({
  movie,
  canDelete,
  onEdit,
  onDeleteRequest,
}: {
  movie: Movie;
  canDelete: boolean;
  onEdit:          (movie: Movie) => void;
  onDeleteRequest: (movie: Movie) => void;
}) {
  return (
    <tr>
      <td>{movie.title}</td>
      <td>{movie.year}</td>
      <td>
        <span className={`badge badge-${movie.rating.toLowerCase()}`}>
          {movie.rating}
        </span>
      </td>
      <td>{new Date(movie.created_at).toLocaleDateString()}</td>
      <td className="actions">
        <button className="btn btn-sm btn-secondary" onClick={() => onEdit(movie)}>
          Edit
        </button>
        {canDelete && (
          <button className="btn btn-sm btn-danger" onClick={() => {
            console.log('[MovieRow] Delete clicked for:', movie.id, movie.title);
            onDeleteRequest(movie);
          }}>
            Delete
          </button>
        )}
      </td>
    </tr>
  );
});

export default observer(function MovieTable() {
  const { movies: movieStore, auth } = useStore();
  const [editing,    setEditing]    = useState<Movie | null>(null);
  const [deleting,   setDeleting]   = useState<Movie | null>(null);

  console.log('[MovieTable] render — deleting:', deleting?.title ?? 'null', '| editing:', editing?.title ?? 'null');

  async function handleUpdate(input: MovieInput) {
    if (!editing) return;
    await movieStore.updateMovie(editing.id, input);
    setEditing(null);
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    await movieStore.deleteMovie(deleting.id);
    setDeleting(null);
  }

  if (movieStore.status === 'loading') {
    return <p className="status-msg">Loading movies…</p>;
  }

  if (movieStore.status === 'error') {
    return <p className="status-msg error">{movieStore.error}</p>;
  }

  if (movieStore.movies.length === 0) {
    return <p className="status-msg">No movies yet. Add one above.</p>;
  }

  if (movieStore.filteredMovies.length === 0) {
    return <p className="status-msg">No movies match your search.</p>;
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="movie-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Rating</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movieStore.filteredMovies.map((movie) => (
              <MovieRow
                key={movie.id}
                movie={movie}
                canDelete={auth.isManager}
                onEdit={setEditing}
                onDeleteRequest={setDeleting}
              />
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <MovieForm
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {(() => { console.log('[MovieTable] ConfirmModal condition — deleting:', deleting?.title ?? 'null'); return null; })()}
      {deleting && (
        <ConfirmModal
          title="Delete Movie"
          message={`Are you sure you want to delete "${deleting.title}" (${deleting.year})? This cannot be undone.`}
          confirmLabel="Yes, Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => { console.log('[MovieTable] modal cancelled'); setDeleting(null); }}
        />
      )}

      <p className="rating-legend">
        {Object.entries(RATING_LABELS).map(([k, v]) => (
          <span key={k}><strong>{k}</strong> {v.split('—')[1].trim()}</span>
        ))}
      </p>
    </>
  );
});
