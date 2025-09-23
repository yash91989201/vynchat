import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Github, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary/5">
      <div className="container mx-auto flex flex-col items-center justify-between gap-8 px-6 py-10 md:flex-row md:px-0">
        {/* Logo + Brand */}
        <Link className="mr-6 flex items-center space-x-3" to="/">
          <Image
            alt="VynChat Logo"
            className="size-12 rounded-lg"
            layout="fullWidth"
            src="/logo.webp"
          />
          <h1 className="hidden font-bold text-2xl sm:inline-block">VynChat</h1>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-wrap justify-center gap-6 font-medium text-sm md:justify-start">
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            to="/blogs"
          >
            Blogs
          </Link>
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            to="/chat"
          >
            Chat
          </Link>
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            to="/about"
          >
            About
          </Link>
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            to="/"
          >
            Terms
          </Link>
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            to="/"
          >
            Privacy
          </Link>
          <Link
            className="text-muted-foreground transition-colors hover:text-foreground"
            to="/admin/log-in"
          >
            Admin Login
          </Link>
        </nav>

        {/* Socials */}
        <div className="flex items-center gap-5">
          <a
            aria-label="Twitter"
            className="text-muted-foreground transition-all hover:scale-110 hover:text-foreground"
            href="https://twitter.com"
            rel="noreferrer"
            target="_blank"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            aria-label="Instagram"
            className="text-muted-foreground transition-all hover:scale-110 hover:text-foreground"
            href="https://instagram.com"
            rel="noreferrer"
            target="_blank"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            aria-label="GitHub"
            className="text-muted-foreground transition-all hover:scale-110 hover:text-foreground"
            href="https://github.com"
            rel="noreferrer"
            target="_blank"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Built by WinApps */}
      <a
        className="flex cursor-pointer flex-col items-center justify-center gap-2 border-border/20 border-t bg-primary/10 px-6 py-4 transition-colors hover:bg-primary/20"
        href="https://winapps.co.in"
        rel="noreferrer"
        target="_blank"
      >
        <span className="text-muted-foreground text-sm">Built by</span>
        <div className="flex items-center gap-2">
          <Image
            alt="WinApps Logo"
            className="size-6 rounded"
            layout="fullWidth"
            src="/winapps-logo.webp"
          />
          <span className="font-semibold text-foreground text-sm">WinApps</span>
        </div>
      </a>
    </footer>
  );
}
