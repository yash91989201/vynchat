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
          "VynChat is a modern chat platform offering multiple chat modes - talk to strangers, join chat rooms, or message followers. Share rich media, connect globally, and build your network with real-time messaging.",
      },
      {
        name: "keywords",
        content: "chat app, messaging, real-time chat, stranger chat, chat rooms, social messaging, online chat, video chat, global chat",
      },
      {
        name: "author",
        content: "VynChat",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "charset",
        content: "UTF-8",
      },
      // Open Graph tags
      {
        property: "og:title",
        content: "VynChat - Connect Beyond Limits",
      },
      {
        property: "og:description",
        content: "A modern chat platform with multiple modes: stranger chat, chat rooms, and follower messaging. Share media, connect globally, and chat in real-time.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:image",
        content: "/logo.webp",
      },
      {
        property: "og:url",
        content: "https://vynchat.com",
      },
      {
        property: "og:site_name",
        content: "VynChat",
      },
      // Twitter Card tags
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "VynChat - Connect Beyond Limits",
      },
      {
        name: "twitter:description",
        content: "Modern chat platform with stranger chat, chat rooms, and follower messaging. Connect globally in real-time.",
      },
      {
        name: "twitter:image",
        content: "/logo.webp",
      },
      // Additional SEO tags
      {
        name: "robots",
        content: "index, follow",
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
      {
        rel: "apple-touch-icon",
        href: "/logo.webp",
      },
      {
        rel: "canonical",
        href: "https://vynchat.com",
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
