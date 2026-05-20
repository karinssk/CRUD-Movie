import { Request, Response } from 'express';
import { z } from 'zod';
import db from '../db/database';
import { Movie } from '../types';

const movieSchema = z.object({
  title:  z.string().min(1).max(255),
  year:   z.number().int().min(1888).max(2100),
  rating: z.enum(['G', 'PG', 'M', 'MA', 'R']),
});

export function getMovies(_req: Request, res: Response): void {
  const movies = db.prepare('SELECT * FROM movies ORDER BY created_at DESC').all() as Movie[];
  res.json(movies);
}

export function createMovie(req: Request, res: Response): void {
  const parsed = movieSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  const { title, year, rating } = parsed.data;
  const stmt = db.prepare(
    'INSERT INTO movies (title, year, rating) VALUES (?, ?, ?) RETURNING *'
  );
  const movie = stmt.get(title, year, rating) as Movie;
  res.status(201).json(movie);
}

export function updateMovie(req: Request, res: Response): void {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  const parsed = movieSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  const { title, year, rating } = parsed.data;
  const stmt = db.prepare(`
    UPDATE movies SET title = ?, year = ?, rating = ?, updated_at = datetime('now')
    WHERE id = ? RETURNING *
  `);
  const movie = stmt.get(title, year, rating, id) as Movie | undefined;

  if (!movie) {
    res.status(404).json({ message: 'Movie not found' });
    return;
  }

  res.json(movie);
}

export function deleteMovie(req: Request, res: Response): void {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  const result = db.prepare('DELETE FROM movies WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).json({ message: 'Movie not found' });
    return;
  }

  res.status(204).send();
}
