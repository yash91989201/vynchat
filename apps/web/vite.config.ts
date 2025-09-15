import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "VynChat",
        short_name: "vynchat",
        description:
          "VynChat is a modern chat application that lets you connect with people from around the world in real-time.",
        theme_color: "#0c0c0c",
      },
      pwaAssets: { disabled: false, config: true },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom"],

          // Radix UI components
          "radix-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],

          // TanStack packages
          tanstack: [
            "@tanstack/react-form",
            "@tanstack/react-query",
            "@tanstack/react-router",
          ],

          // Text editor
          editor: [
            "@tiptap/extension-bullet-list",
            "@tiptap/extension-heading",
            "@tiptap/extension-ordered-list",
            "@tiptap/react",
            "@tiptap/starter-kit",
          ],

          // Auth and backend
          auth: ["@supabase/supabase-js", "better-auth"],

          // UI utilities
          "ui-utils": [
            "lucide-react",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "next-themes",
          ],

          // Form and validation
          "form-utils": [
            "react-hook-form",
            "@hookform/resolvers",
            "zod",
            "date-fns",
          ],

          // Charts
          charts: ["recharts"],

          // Media and carousel
          media: ["embla-carousel-react", "@unpic/react"],

          // Utilities
          utils: [
            "emoji-picker-react",
            "glin-profanity",
            "html-react-parser",
            "sonner",
            "cmdk",
            "input-otp",
            "react-day-picker",
            "react-resizable-panels",
            "vaul",
            "tw-animate-css",
          ],

          // ORPC
          orpc: ["@orpc/client", "@orpc/tanstack-query"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  preview: {
    allowedHosts: process.env.VITE_ALLOWED_HOSTS
      ? process.env.VITE_ALLOWED_HOSTS.split(",")
      : [],
  },
});
