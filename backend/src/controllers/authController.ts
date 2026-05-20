import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../db/database';
import { UserRow } from '../types';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  const { username, password } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });

  res.json({ token, user: payload });
}
