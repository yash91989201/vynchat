import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/blogs", label: "Blogs" },
    { to: "/chat", label: "Chat" },
    { to: "/about", label: "About" },
  ] as const;

  return (
    <header className="border-b py-4">
      <div className="container mx-auto flex items-center gap-6">
        <Link className="flex items-center gap-6" to="/">
          <Image
            alt="VynChat Logo"
            className="size-12 rounded-lg"
            layout="fullWidth"
            src="/logo.webp"
          />
          <h1 className="font-bold text-3xl">VynChat</h1>
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-6">
          {links.map(({ to, label }) => (
            <Link
              className={cn(
                buttonVariants({ variant: "link" }),
                "px-0 text-lg"
              )}
              key={to}
              to={to}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
