import { Router, Response, Request, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET is not configured");
}

// Middleware to authenticate token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized, token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Attach the decoded user data (including role) to the request object
    (req as any).user = user;
    next();
  });
};

// Login route with token generation
router.post("/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: "Username doesn't exist" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login successful",
      token, // Send token to the client
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
});

// Protected route that requires token
router.get("/me", authenticateToken, (req: Request, res: Response) => {
  return res.status(200).json({ user: (req as any).user });
});

// No-op logout for JWT
router.post("/logout", (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ message: "Logout successful (client should remove the token)" });
});
export default router;
