import { adminProcedure } from "@/lib/orpc";

export const adminUserRouter = {
  listUsers: adminProcedure.input().output().handler(),
};
