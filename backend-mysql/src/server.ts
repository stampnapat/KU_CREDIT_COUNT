import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";

const PORT = Number(process.env.PORT || 8081);

app.listen(PORT, () => {
  console.log(`✅ MySQL API on http://localhost:${PORT}`);
});