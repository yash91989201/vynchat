import { publicProcedure } from "@/lib/orpc";

export const healthCheckRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
};
