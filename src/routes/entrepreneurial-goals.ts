import express, { Request, Response } from 'express';
import pool from '../db';
import { authenticateAccessToken } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/entrepreneurial-goals:
 *   get:
 *     summary: Retrieve a list of entrepreneurial goals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of entrepreneurial goals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *       401:
 *         description: Unauthorized - Invalid or expired token
 */
router.get(
  '/entrepreneurial-goals',
  authenticateAccessToken,
  async (req: Request, res: Response) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, title, description FROM entrepreneurial_goals'
      );
      res.status(200).json(rows);
    } catch {
      res.status(500).send('An error occurred while retrieving goals');
    }
  }
);

export default router;
