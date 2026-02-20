import { Router } from "express";
import { z } from "zod";
import { CompletedCourseModel } from "../models/CompletedCourse";

export const completedCourseRouter = Router();

const addSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  courseName: z.string().min(1),
  category: z.string().min(1),
  credits: z.number().positive(),
  grade: z.string().min(1),
  term: z.string().min(1)
});

// ADD completed course
completedCourseRouter.post("/", async (req, res) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const doc = await CompletedCourseModel.create(parsed.data);
  res.status(201).json(doc);
});

// Update grade
completedCourseRouter.put("/:id/grade", async (req, res) => {
  const parsed = z.object({ grade: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const updated = await CompletedCourseModel.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { $set: { grade: parsed.data.grade } },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Completed course not found" });
  res.json(updated);
});

// Soft delete
completedCourseRouter.delete("/:id", async (req, res) => {
  const updated = await CompletedCourseModel.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Completed course not found" });
  res.json({ message: "Deleted (soft)", id: req.params.id });
});

// (ช่วยเดโม) list ของ student
completedCourseRouter.get("/by-student/:studentId", async (req, res) => {
  const docs = await CompletedCourseModel.find({
    studentId: req.params.studentId,
    isDeleted: false
  }).lean();

  res.json(docs);
});