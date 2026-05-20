import React, { useState, useEffect } from 'react';
import { Movie, MovieInput, RATINGS, Rating } from '../types';
import Select from './Select';

const RATING_OPTIONS = RATINGS.map((r) => ({ value: r, label: r }));

interface Props {
  initial?: Movie;
  onSubmit: (input: MovieInput) => Promise<void>;
  onCancel: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function MovieForm({ initial, onSubmit, onCancel }: Props) {
  const [title,   setTitle]   = useState(initial?.title  ?? '');
  const [year,    setYear]    = useState(initial?.year   ?? CURRENT_YEAR);
  const [rating,  setRating]  = useState<Rating>(initial?.rating ?? 'G');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setYear(initial.year);
      setRating(initial.rating);
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title is required'); return; }
    if (year < 1888 || year > CURRENT_YEAR + 5) {
      setError(`Year must be between 1888 and ${CURRENT_YEAR + 5}`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), year, rating });
    } catch (err: unknown) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit Movie' : 'Add Movie'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="year">Year Released</label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={1888}
              max={CURRENT_YEAR + 5}
            />
          </div>

          <div className="field">
            <label>Rating</label>
            <Select
              value={rating}
              onChange={(v) => setRating(v as Rating)}
              options={RATING_OPTIONS}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : initial ? 'Save Changes' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function extractMessage(err: unknown): string {
  if (
    typeof err === 'object' && err !== null &&
    'response' in err &&
    typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (err as { response: { data: { message: string } } }).response.data.message;
  }
  return 'Failed to save movie';
}
