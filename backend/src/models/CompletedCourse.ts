import { Schema, model } from "mongoose";

const CompletedCourseSchema = new Schema(
  {
    studentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },
    category: { type: String, required: true }, // ต้องตรงกับ plan.categories.name
    credits: { type: Number, required: true },
    grade: { type: String, required: true },
    term: { type: String, required: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const CompletedCourseModel = model("completed_courses", CompletedCourseSchema);