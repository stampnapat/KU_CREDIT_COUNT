import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const progressRouter = Router();

/**
 * GET /api/curriculum-progress
 * เดโม: สรุปจำนวนรายวิชาทั้งหมด + หน่วยกิตรวม แยกตาม category จากตาราง courses
 */
progressRouter.get("/", async (_req, res) => {
  const courses = await prisma.course.findMany({ where: { isDeleted: false } });

  const totalCourses = courses.length;
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);

  const byCategory: Record<string, { courses: number; credits: number }> = {};
  for (const c of courses) {
    if (!byCategory[c.category]) byCategory[c.category] = { courses: 0, credits: 0 };
    byCategory[c.category].courses += 1;
    byCategory[c.category].credits += c.credits;
  }

  res.json({ totalCourses, totalCredits, byCategory });
});