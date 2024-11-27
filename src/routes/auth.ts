import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db';
import { RowDataPacket } from 'mysql2';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: "admin"
 *               password:
 *                 type: string
 *                 default: "admin"
 *               retry_password:
 *                 type: string
 *                 default: "admin"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, retry_password } = req.body;
  if (password !== retry_password) {
    res.status(400).send('Password do not match');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO user (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'admin']
    );
    res.status(201).send('User created successfully');
  } catch {
    res.status(400).send('Unable to create user');
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM user WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows[0];

    if (user && (await bcrypt.compare(password, user['password']))) {
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        maxAge: 15 * 60 * 1000, // 15 minutes expiration
      });

      res.status(200).json({
        accessToken: accessToken,
        refreshToken,
      });

      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);

      // res.status(200).send('Login successful');
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch {
    res.status(401).send('Unauthorized');
  }
});

export default router;
