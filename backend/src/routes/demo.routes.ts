import { Router } from "express";
import { StudyPlanModel } from "../models/StudyPlan";
import { CompletedCourseModel } from "../models/CompletedCourse";

export const demoRouter = Router();

/**
 * POST /api/demo/reset
 * body: { studentId?: "S001" }
 */
demoRouter.post("/reset", async (req, res) => {
  const studentId = (req.body?.studentId || "S001") as string;

  await StudyPlanModel.deleteMany({ studentId });
  await CompletedCourseModel.deleteMany({ studentId });

  const plan = await StudyPlanModel.create({
    studentId,
    program: "Computer Science",
    version: "2026",
    categories: [
      { name: "Core", requiredCredits: 30 },
      { name: "Major", requiredCredits: 45 },
      { name: "Free", requiredCredits: 6 }
    ],
    isDeleted: false
  });

  const courses = await CompletedCourseModel.insertMany([
    {
      studentId,
      courseId: "CS101",
      courseName: "Programming I",
      category: "Core",
      credits: 3,
      grade: "A",
      term: "1/2026",
      isDeleted: false
    },
    {
      studentId,
      courseId: "CS201",
      courseName: "Data Structures",
      category: "Major",
      credits: 3,
      grade: "B+",
      term: "1/2026",
      isDeleted: false
    }
  ]);

  res.json({ message: "Demo reset done", plan, coursesCount: courses.length });
});