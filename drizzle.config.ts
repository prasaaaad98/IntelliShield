// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config: Config = {
  schema: path.resolve(__dirname, 'shared/schema.ts'), // ✅ remove leading './'
  out: path.resolve(__dirname, 'drizzle/migrations'),
  driver: 'pg',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};

export default config;
