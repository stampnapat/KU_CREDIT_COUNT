import { Router } from "express";
import { buildSummary } from "../services/summary.service";

export const summaryRouter = Router();

summaryRouter.get("/:studentId", async (req, res) => {
  const summary = await buildSummary(req.params.studentId);
  res.json(summary);
});