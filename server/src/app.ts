import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./features/auth/auth.routes";
import documentRoutes from "./features/documents/documents.routes";
import userRoutes from "./features/users/users.routes";

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Mount feature routes
app.use("/", authRoutes); 
app.use("/documents", documentRoutes);
app.use("/users", userRoutes);

export default app;
