import dotenv from "dotenv";
import { app } from "./app";
import { connectMongo } from "./config/mongo";

dotenv.config();

const PORT = Number(process.env.PORT || 8080);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ku_credit_demo";

async function main() {
  await connectMongo(MONGO_URI);
  app.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`));
}

main().catch(err => {
  console.error("❌ Server error:", err);
  process.exit(1);
});