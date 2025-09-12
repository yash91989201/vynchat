import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";
import * as authSchema from "@/db/schema/auth";
import { env } from "@/env";

export const db = drizzle(env.DATABASE_URL, {
  schema: {
    ...schema,
    ...authSchema,
  },
});

export type DBType = typeof db;
