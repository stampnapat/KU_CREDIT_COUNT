import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: "demo1@ku.ac.th", password: "1234", name: "Demo Student" },
      { email: "admin@ku.ac.th", password: "admin", name: "Admin" }
    ],
    skipDuplicates: true
  });

  await prisma.course.createMany({
    data: [
      { code: "CS101", name: "Programming I", category: "Core", credits: 3 },
      { code: "CS201", name: "Data Structures", category: "Major", credits: 3 },
      { code: "GEN001", name: "General Education", category: "Free", credits: 3 }
    ],
    skipDuplicates: true
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });