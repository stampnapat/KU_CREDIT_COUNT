import { StudyPlanModel } from "../models/StudyPlan";
import { CompletedCourseModel } from "../models/CompletedCourse";

export async function buildSummary(studentId: string) {
  const plan = await StudyPlanModel.findOne({ studentId, isDeleted: false }).lean();
  const completed = await CompletedCourseModel.find({ studentId, isDeleted: false }).lean();

  const totalCredits = completed.reduce((sum, c) => sum + (c.credits || 0), 0);

  if (!plan) {
    return {
      studentId,
      totalCredits,
      categories: [],
      remainingList: [],
      message: "No study plan found"
    };
  }

  const earnedByCategory: Record<string, number> = {};
  for (const c of completed) {
    earnedByCategory[c.category] = (earnedByCategory[c.category] || 0) + c.credits;
  }

  const categories = plan.categories.map(cat => {
    const earned = earnedByCategory[cat.name] || 0;
    const remaining = Math.max(cat.requiredCredits - earned, 0);
    return {
      category: cat.name,
      required: cat.requiredCredits,
      earned,
      remaining,
      completed: earned >= cat.requiredCredits
    };
  });

  const remainingList = categories
    .filter(c => !c.completed)
    .map(c => ({ category: c.category, remainingCredits: c.remaining }));

  return {
    studentId,
    program: plan.program,
    version: plan.version,
    totalCredits,
    categories,
    remainingList
  };
}