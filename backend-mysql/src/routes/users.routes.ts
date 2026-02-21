import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const usersRouter = Router();

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1)
});

usersRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const user = await prisma.user.create({ data: parsed.data });
  res.status(201).json(user);
});

usersRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({ where: { isDeleted: false } });
  res.json(users);
});

usersRouter.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = createSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data
  });
  res.json(user);
});

usersRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.user.update({ where: { id }, data: { isDeleted: true } });
  res.json({ message: "Deleted (soft)", id });
});