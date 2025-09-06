import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { ArrowUp, Github, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col justify-between md:flex-row">
          <div className="mb-8 md:mb-0">
            <Link className="flex items-center gap-6" to="/">
              <Image
                alt="VynChat Logo"
                className="size-12 rounded-lg"
                layout="fullWidth"
                src="/logo.webp"
              />
              <h1 className="font-bold text-3xl">VynChat</h1>
            </Link>
            <p className="mt-4 max-w-xs text-muted-foreground text-sm">
              Simplifying complexity, one interface at a time.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                aria-label="Twitter"
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="https://twitter.com"
                rel="noreferrer"
                target="_blank"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="https://instagram.com"
                rel="noreferrer"
                target="_blank"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                aria-label="GitHub"
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="https://github.com"
                rel="noreferrer"
                target="_blank"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/about"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/blogs"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    to="/"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-center text-muted-foreground text-sm md:text-left">
            © 2025 VynChat. All rights reserved.
          </p>

          <Button aria-label="Scroll to top" onClick={scrollToTop}>
            Back to top <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}

