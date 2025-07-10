import dotenv from "dotenv";
import app from "./app.js";
import { PORT } from "./constant.js";

dotenv.config({ path: "./.env" });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});