import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const coursesRouter = Router();

const createSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  credits: z.number().int().positive()
});

coursesRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const course = await prisma.course.create({ data: parsed.data });
  res.status(201).json(course);
});

coursesRouter.get("/", async (_req, res) => {
  const courses = await prisma.course.findMany({ where: { isDeleted: false } });
  res.json(courses);
});

coursesRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const course = await prisma.course.update({
    where: { id },
    data: parsed.data
  });
  res.json(course);
});

coursesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.course.update({ where: { id }, data: { isDeleted: true } });
  res.json({ message: "Deleted (soft)", id });
});