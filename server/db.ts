// server/db.ts

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import * as schema from '@shared/schema';

// Load .env variables
dotenv.config();

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("❌ DATABASE_URL must be set in .env");
}

// Create PostgreSQL pool
export const pool = new Pool({ connectionString: dbUrl });

// Init Drizzle with schema
export const db = drizzle(pool, { schema });
