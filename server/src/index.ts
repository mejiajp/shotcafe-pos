import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";
import orderRouter from "./routes/orders";
import authRouter from "./routes/auth";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not configured");
}

// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Configure session
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.post("/create", async (req, res) => {
  const { name, price, category, image } = req.body;
  return res.json(name);
});

app.use("/auth", authRouter);

// Serve static files from the 'assets' directory
app.use("/assets", express.static(path.join(__dirname, "../assets")));

// call for products
app.use("/products", productsRouter);

// call for sales
app.use("/sales", salesRouter);

// call for order (in breakdown)
app.use("/orders", orderRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
