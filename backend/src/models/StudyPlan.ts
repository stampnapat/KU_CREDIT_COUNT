import { Schema, model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    requiredCredits: { type: Number, required: true }
  },
  { _id: false }
);

const StudyPlanSchema = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    program: { type: String, required: true },
    version: { type: String, required: true },
    categories: { type: [CategorySchema], default: [] },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const StudyPlanModel = model("study_plans", StudyPlanSchema);