import { Router } from "express";
import { z } from "zod";
import { StudyPlanModel } from "../models/StudyPlan";

export const studyPlanRouter = Router();

const planSchema = z.object({
  studentId: z.string().min(1),
  program: z.string().min(1),
  version: z.string().min(1),
  categories: z.array(
    z.object({
      name: z.string().min(1),
      requiredCredits: z.number().nonnegative()
    })
  ).default([])
});

// CREATE
studyPlanRouter.post("/", async (req, res) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  // demo: 1 student มีได้ 1 plan (ถ้ามีอยู่แล้วให้ update แทน)
  const upserted = await StudyPlanModel.findOneAndUpdate(
    { studentId: parsed.data.studentId },
    { $set: { ...parsed.data, isDeleted: false } },
    { upsert: true, new: true }
  );

  res.status(201).json(upserted);
});

// READ by studentId
studyPlanRouter.get("/:studentId", async (req, res) => {
  const doc = await StudyPlanModel.findOne({
    studentId: req.params.studentId,
    isDeleted: false
  }).lean();

  if (!doc) return res.status(404).json({ message: "Study plan not found" });
  res.json(doc);
});

// UPDATE by id
studyPlanRouter.put("/:id", async (req, res) => {
  const parsed = planSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const updated = await StudyPlanModel.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { $set: parsed.data },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Study plan not found" });
  res.json(updated);
});

// SOFT DELETE by id
studyPlanRouter.delete("/:id", async (req, res) => {
  const updated = await StudyPlanModel.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Study plan not found" });
  res.json({ message: "Deleted (soft)", id: req.params.id });
});