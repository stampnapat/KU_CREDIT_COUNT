import express from "express";
import cors from "cors";
import { usersRouter } from "./routes/users.routes";
import { coursesRouter } from "./routes/courses.routes";
import { progressRouter } from "./routes/progress.routes";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true, service: "mysql-api" }));

app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/curriculum-progress", progressRouter);