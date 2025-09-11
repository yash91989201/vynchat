import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@server/router";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { env } from "@/env";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const link = new RPCLink({
  url: `${env.VITE_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const orpcClient: AppRouterClient = createORPCClient(link);

export const queryUtils = createTanstackQueryUtils(orpcClient);
