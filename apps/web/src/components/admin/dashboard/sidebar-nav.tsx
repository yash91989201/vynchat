import { Link, useLocation } from "@tanstack/react-router";
import {
  Book,
  Home,
  LineChart,
  MessageSquare,
  Package,
  PanelLeft,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  {
    href: "/admin/dashboard",
    icon: Home,
    label: "Dashboard",
  },
  {
    href: "/admin/dashboard/blogs",
    icon: Book,
    label: "Blogs",
  },
  {
    href: "/admin/dashboard/categories",
    icon: Package,
    label: "Categories",
  },
  {
    href: "/admin/dashboard/tags",
    icon: Tag,
    label: "Tags",
  },
  {
    href: "/admin/dashboard/comments",
    icon: MessageSquare,
    label: "Comments",
  },
  {
    href: "/admin/dashboard/users",
    icon: Users,
    label: "Users",
  },
];

export function SideNav() {
  const { pathname } = useLocation();
  return (
    <TooltipProvider>
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 py-4 lg:h-[60px] lg:px-6">
            <Link className="flex items-center gap-2 font-semibold" to="/">
              <LineChart className="h-6 w-6" />
              <h1 className="font-bold text-2xl text-primary">VynChat</h1>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 font-medium text-sm lg:px-4">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    pathname === href ? "bg-muted text-primary" : ""
                  }`}
                  key={href}
                  to={href}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button className="w-full" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export function AdminHeader() {
  const pathname = useLocation().pathname;
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="shrink-0 md:hidden" size="icon" variant="outline">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col" side="left">
          <nav className="grid gap-2 font-medium text-base">
            <Link
              className="mb-4 flex items-center gap-2 p-3 font-semibold text-lg"
              to="/"
            >
              <LineChart className="h-6 w-6" />
              <h1 className="font-bold text-2xl text-primary">VynChat</h1>
            </Link>
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                  pathname === href ? "bg-muted text-primary" : ""
                }`}
                key={href}
                to={href}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blogs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
