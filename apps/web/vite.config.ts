import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const manualChunks: Record<string, string[]> = {
  react: ["react", "react-dom", "scheduler", "react/jsx-runtime"],
  tanstack: [
    "@tanstack/history",
    "@tanstack/react-form",
    "@tanstack/react-query",
    "@tanstack/react-router",
    "@tanstack/react-table",
    "@tanstack/router-core",
  ],
  radix: [
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
  tiptap: [
    "@tiptap/extension-bullet-list",
    "@tiptap/extension-heading",
    "@tiptap/extension-ordered-list",
    "@tiptap/react",
    "@tiptap/starter-kit",
    "prosemirror-model",
    "prosemirror-state",
    "prosemirror-view",
  ],
  supabase: ["@supabase/supabase-js"],
  forms: ["react-hook-form", "@hookform/resolvers", "zod"],
  ui: [
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
    "sonner",
    "lucide-react",
    "vaul",
    "embla-carousel-react",
    "react-resizable-panels",
    "cmdk",
    "next-themes",
    "input-otp",
    "emoji-picker-react",
  ],
  charts: ["recharts"],
  utils: [
    "date-fns",
    "export-to-csv",
    "html-react-parser",
    "@unpic/react",
    "@ctrl/react-adsense",
    "glin-profanity",
  ],
  auth: ["better-auth"],
};

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
        manualChunks,
      },
    },
  },
});
