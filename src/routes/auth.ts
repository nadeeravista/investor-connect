import { Router, Request, Response } from "express"
import bcrypt from "bcrypt"
import pool from "../db"
import { RowDataPacket } from "mysql2"

const router = Router()

interface User {
  id: number
  email: string
  password: string
}

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
 *               password:
 *                 type: string
 *               retry_password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, retry_password } = req.body
  if (password !== retry_password) {
    res.status(400).send("Password do not match")
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      "INSERT INTO user (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    )
  } catch (error) {
    res.status(400).send(error)
  }

  res.status(201).send("User created successfully")
})

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
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM user WHERE email = ? LIMIT 1",
      [email]
    )
    console.log(email)
    const user = rows[0]
    console.log(rows)
    if (user && (await bcrypt.compare(password, user["password"]))) {
      res.status(200).send("Login successful")
    }
  } catch (error) {
    res.status(401).send("Unauthorized")
  }
  res.status(401).send("Unauthorized")
})

export default router
