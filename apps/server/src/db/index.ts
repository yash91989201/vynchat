import { drizzle } from "drizzle-orm/bun-sql";
import {
  comment,
  like,
  message,
  post,
  room,
  roomBanned,
  roomMembers,
  roomModerators,
  userFollowers,
  userFollowing,
} from "@/db/schema";
import { account, session, user, verification } from "@/db/schema/auth";
import { env } from "@/env";

const schema = {
  user,
  session,
  account,
  verification,
  comment,
  like,
  message,
  room,
  roomBanned,
  roomMembers,
  roomModerators,
  userFollowers,
  userFollowing,
  post,
};

export const db = drizzle(env.DATABASE_URL, {
  schema,
});

export type DBType = typeof db;
