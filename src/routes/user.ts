import express, { Request, Response } from 'express';
import pool from '../db';
import { authenticateAccessToken } from '../middleware/auth'; // Assuming you have an authentication middleware

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 */
router.get(
  '/users',
  authenticateAccessToken,
  async (req: Request, res: Response) => {
    try {
      const [rows] = await pool.query('SELECT id, email, role FROM user');
      console.log(rows);
      if (!rows) {
        res.status(404).send('No users found');
      }
      res.status(200).json(rows);
    } catch {
      res.status(500).send('An error occurred while retrieving users');
    }
  }
);

export default router;
