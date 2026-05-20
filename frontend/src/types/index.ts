export type Role = 'MANAGER' | 'TEAMLEADER' | 'FLOORSTAFF';
export type Rating = 'G' | 'PG' | 'M' | 'MA' | 'R';

export const RATINGS: Rating[] = ['G', 'PG', 'M', 'MA', 'R'];

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: Rating;
  created_at: string;
  updated_at: string;
}

export interface MovieInput {
  title: string;
  year: number;
  rating: Rating;
}
