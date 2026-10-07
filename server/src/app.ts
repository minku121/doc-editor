import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./features/auth/auth.routes";
import documentRoutes from "./features/documents/documents.routes";
import userRoutes from "./features/users/users.routes";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Mount feature routes
app.use("/", authRoutes); 
app.use("/documents", documentRoutes);
app.use("/users", userRoutes);

export default app;
