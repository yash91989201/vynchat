import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { MobileNav } from "@/components/shared/mobile-nav";
import { UserMenu } from "@/components/shared/user-menu";

export const Header = () => {
  const links = [
    { to: "/", label: "Home" },
    { to: "/blogs", label: "Blogs" },
    { to: "/chat", label: "Stranger Chat", search: { tab: "stranger-chat" } },
    { to: "/chat", label: "Chat Rooms", search: { tab: "chat-rooms" } },
    { to: "/chat", label: "Following", search: { tab: "following" } },
    { to: "/feedback", label: "Feedback" },
    { to: "/about", label: "About" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-3 md:px-6">
        <div className="flex flex-shrink-0 items-center gap-3">
          <Link className="flex items-center space-x-3" to="/">
            <Image
              alt="VynChat Logo"
              className="size-10 rounded-lg"
              layout="fullWidth"
              src="/logo.webp"
            />
            <span className="hidden font-extrabold text-lg tracking-tight sm:inline-block">
              VynChat
            </span>
          </Link>
        </div>

        <nav className="hidden flex-1 items-center justify-center lg:flex">
          <ul className="flex items-center gap-6 font-medium text-sm">
            {links.map(({ to, label }) => (
              <li key={to}>
                <Link
                  activeOptions={{ includeSearch: true }}
                  activeProps={{ className: "underline" }}
                  className="rounded px-2 py-1 text-foreground/70 transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  to={to}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-4 flex flex-1 items-center justify-end gap-3 lg:flex-0">
          <UserMenu />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
};
