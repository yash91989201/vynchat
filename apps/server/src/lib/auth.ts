import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous } from "better-auth/plugins";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema/auth";
import { env } from "@/env";
import { generateName } from "@/lib/generate-name";
import { resend } from "@/lib/resend";

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
  trustedOrigins: env.CORS_ORIGIN,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      try {
        await resend.emails.send({
          from: "VynChat <support@vynchat.com>",
          to: user.email,
          subject: "Reset your password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; margin-bottom: 24px;">Reset Your Password</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
                Hi ${user.name || "there"},
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset your password for your VynChat account.
                If you didn't make this request, you can safely ignore this email.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}"
                   style="background-color: #007bff; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 6px; display: inline-block;
                          font-weight: 500;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 16px;">
                Or copy and paste this link in your browser:
              </p>
              <p style="color: #007bff; word-break: break-all; margin-bottom: 24px;">
                ${url}
              </p>
              <p style="color: #999; font-size: 14px; line-height: 1.6;">
                This link will expire in 1 hour for security reasons.
              </p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        throw new Error("Failed to send password reset email");
      }
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
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
      scopes: ["email", "public_profile"],
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "facebook"],
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
      isBot: {
        type: "boolean",
        required: false,
      },
      botProfile: {
        type: "string",
        required: false,
      },
      lastActive: {
        type: "date",
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
