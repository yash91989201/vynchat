import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavProps {
  links: readonly {
    to: string;
    label: string;
    search?: { tab: "following" | "stranger-chat" | "chat-rooms" };
  }[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col pr-0" side="left">
        <Link
          className="flex items-center space-x-2 px-6 pt-6"
          onClick={() => setOpen(false)}
          to="/"
        >
          <Image
            alt="VynChat Logo"
            className="size-6 rounded-lg"
            layout="fullWidth"
            src="/logo.webp"
          />
          <span className="font-bold">VynChat</span>
        </Link>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid items-start gap-2 px-4 font-medium text-sm">
            {links.map(({ to, label, search }) => (
              <Link
                activeProps={{ className: "bg-muted text-primary" }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                key={to}
                onClick={() => setOpen(false)}
                to={to}
                search={search}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
