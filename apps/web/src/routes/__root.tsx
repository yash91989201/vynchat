import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@server/router";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";
import { Header } from "@/components/shared/header";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { orpcClient, queryUtils } from "@/utils/orpc";
import { link } from "@/utils/orpc";
import "@/styles/index.css";
import { Footer } from "@/components/shared/footer";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { authClient } from "@/lib/auth-client";

export interface RouterAppContext {
  queryUtils: typeof queryUtils;
  queryClient: QueryClient;
  orpcClient: typeof orpcClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        title: "VynChat - Connect Beyond Limits",
      },
      {
        name: "description",
        content:
          "VynChat is a modern chat application that lets you connect with people from around the world in real-time.",
      },
      {
        name: "google-adsence-account",
        content: "ca-pub-3840637479155499",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
    scripts: [
      {
        async: true,
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3840637479155499",
        crossOrigin: "anonymous",
      },
      {
        defer: true,
        src: "https://umami.services.vynchat.com/script.js",
        "data-website-id": "ffcaaaa3-d068-4ac4-b5f0-5e74a16152b9",
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await authClient.getSession();

    return {
      session: session.data,
    };
  },
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  const [client] = useState<AppRouterClient>(() => createORPCClient(link));
  const [_orpcUtils] = useState(() => createTanstackQueryUtils(client));

  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="relative grid min-h-screen grid-rows-[auto_1fr]">
          <Header />
          {isFetching ? <FullScreenLoader /> : <Outlet />}
          <Footer />
        </div>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
    </>
  );
}
