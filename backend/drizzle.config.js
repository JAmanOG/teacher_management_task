import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// dotenv.config();
const {DATABASE_URL} = process.env;
console.log("Drizzle config - Database URL:", DATABASE_URL);

export default defineConfig({
  schema: "./db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL
  },
  verbose: true,
  strict: true
});