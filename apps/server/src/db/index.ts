import { drizzle } from "drizzle-orm/bun-sql";
import { account, session, user, verification } from "@/db/schema/auth";
import { env } from "@/env";

const schema = {
  user,
  session,
  account,
  verification,
};

export const db = drizzle(env.DATABASE_URL, {
  schema,
});
