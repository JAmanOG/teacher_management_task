import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
import dotenv from "dotenv";
const { Pool } = pg;
dotenv.config({ path: "./.env" });


const { DATABASE_URL } = process.env;
console.log("Drizzle config - Database URL:", DATABASE_URL);

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false

});


const db = drizzle({ client: pool }, { schema });

export default db;