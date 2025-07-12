import dotenv from "dotenv";
import app from "./app.js";
import { PORT } from "./constant.js";


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});