import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Github, Instagram, Twitter } from "lucide-react";
import { FooterAd } from "./google-ads";

export function Footer() {
  return (
    <footer className="bg-primary/5">
      <FooterAd />
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

      {/* Bottom bar */}
      <div className="container mx-auto border-t">
        <p className="py-6 text-center text-muted-foreground">
          © {new Date().getFullYear()} VynChat. All rights reserved. Built with
          ❤
        </p>
      </div>
    </footer>
  );
}
