import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous } from "better-auth/plugins";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema/auth";
import { env } from "@/env";
import { generateName } from "@/lib/generate-name";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
    },
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
    facebook: {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      scopes: ["email"],
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  user: {
    additionalFields: {
      bio: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    admin(),
    anonymous({
      emailDomainName: "gmail.com",
      generateName,
    }),
  ],
});
