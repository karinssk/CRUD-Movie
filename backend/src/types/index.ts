export type Role = 'MANAGER' | 'TEAMLEADER' | 'FLOORSTAFF';
export type Rating = 'G' | 'PG' | 'M' | 'MA' | 'R';

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface UserRow extends User {
  password_hash: string;
}

export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: Rating;
  created_at: string;
  updated_at: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
