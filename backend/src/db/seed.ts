import bcrypt from 'bcrypt';
import db from './database';

const SALT_ROUNDS = 12;

const users = [
  { username: 'manager1', password: 'manager123', role: 'MANAGER' },
  { username: 'leader1',  password: 'leader123',  role: 'TEAMLEADER' },
  { username: 'staff1',   password: 'staff123',   role: 'FLOORSTAFF' },
];

const movies = [
  { title: 'The Shawshank Redemption', year: 1994, rating: 'M' },
  { title: 'The Godfather',            year: 1972, rating: 'MA' },
  { title: 'The Dark Knight',          year: 2008, rating: 'M' },
  { title: 'Pulp Fiction',             year: 1994, rating: 'R' },
  { title: 'Toy Story',                year: 1995, rating: 'G' },
];

async function seed() {
  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)'
  );
  const insertMovie = db.prepare(
    'INSERT OR IGNORE INTO movies (title, year, rating) VALUES (?, ?, ?)'
  );

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    insertUser.run(u.username, hash, u.role);
  }

  for (const m of movies) {
    insertMovie.run(m.title, m.year, m.rating);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed();
