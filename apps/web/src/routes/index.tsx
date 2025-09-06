import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  MessageCircle,
  Repeat,
  Search,
  Send,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="flex-1">
        <section className="relative w-full bg-background py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="-translate-x-1/2 -translate-y-1/2 -z-10 absolute top-1/2 left-1/2 h-full w-full max-w-4xl bg-primary/5 blur-3xl" />
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col items-center justify-center space-y-4 text-center lg:items-start lg:text-left">
                <div className="space-y-2">
                  <h1 className="bg-gradient-to-r from-primary to-foreground bg-clip-text font-bold text-4xl text-transparent tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Connect Instantly. Chat Freely.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    VynChat is a modern chat application that lets you connect
                    with people from around the world in real-time.
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-2 lg:justify-start min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link to="/">Start Chatting</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/">Learn More</Link>
                  </Button>
                </div>
              </div>
              <picture>
                <source srcSet="/logo.png" type="image/png" />
                <img
                  alt="Hero"
                  className="fade-in zoom-in-50 mx-auto aspect-video animate-in overflow-hidden rounded-xl object-cover duration-1000 sm:w-full lg:order-last lg:aspect-square"
                  height={450}
                  src="/logo.png"
                  width={800}
                />
              </picture>
            </div>
          </div>
        </section>

        <section
          className="w-full bg-muted/40 py-12 md:py-24 lg:py-32"
          id="features"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="font-bold text-3xl tracking-tighter sm:text-5xl">
                  Why You'll Love VynChat
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We've packed VynChat with features to make your chat
                  experience seamless, fun, and secure.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="size-8 text-primary" />
                  <h3 className="font-bold text-xl">Live Rooms</h3>
                </div>
                <p className="text-muted-foreground">
                  Join trending topics or create your own public/private rooms
                  in seconds.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Zap className="size-8 text-primary" />
                  <h3 className="font-bold text-xl">Blazing Fast</h3>
                </div>
                <p className="text-muted-foreground">
                  Our lightweight app works smoothly even on slower networks.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Repeat className="size-8 text-primary" />
                  <h3 className="font-bold text-xl">Swipe to Skip</h3>
                </div>
                <p className="text-muted-foreground">
                  Quickly find conversations that match your vibe.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="size-8 text-primary" />
                  <h3 className="font-bold text-xl">Privacy First</h3>
                </div>
                <p className="text-muted-foreground">
                  Minimal data collection, optional profiles, and robust privacy
                  controls.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Smartphone className="size-8 text-primary" />
                  <h3 className="font-bold text-xl">Cross-Platform</h3>
                </div>
                <p className="text-muted-foreground">
                  Enjoy a seamless experience on mobile, tablet, and desktop.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <BadgeCheck className="size-8 text-primary" />
                  <h3 className="font-bold text-xl">Photo Sharing</h3>
                </div>
                <p className="text-muted-foreground">
                  Instantly share images with smart, built-in content
                  moderation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-background py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Live Preview
                </div>
                <h2 className="font-bold text-3xl tracking-tighter sm:text-5xl">
                  See VynChat in Action
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our interface is designed to be intuitive, responsive, and
                  beautiful. Here's a sneak peek.
                </p>
              </div>
            </div>
            <div className="relative mt-12">
              <div className="-translate-x-1/2 -translate-y-1/2 -z-10 absolute top-1/2 left-1/2 h-3/4 w-[90%] max-w-4xl bg-primary/10 blur-3xl" />
              <div className="mx-auto max-w-md rounded-xl border bg-card text-card-foreground shadow-2xl shadow-primary/10 md:max-w-4xl">
                <div className="grid h-[550px] grid-cols-1 md:grid-cols-[260px_1fr]">
                  <div className="hidden flex-col rounded-l-xl border-r bg-muted/40 md:flex">
                    <div className="p-4">
                      <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="w-full bg-background pl-8"
                          placeholder="Search"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      <Button
                        className="flex h-auto items-center justify-start gap-3 rounded-lg bg-primary/10 p-2"
                        variant="ghost"
                      >
                        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                          <picture>
                            <source
                              srcSet="https://avatar.vercel.sh/alex"
                              type="image/png"
                            />
                            <img
                              alt="Alex"
                              className="aspect-square h-full w-full"
                              height={100}
                              src="https://avatar.vercel.sh/alex"
                              width={100}
                            />
                          </picture>
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold">Alex</p>
                          <p className="truncate text-muted-foreground text-sm">
                            Typing...
                          </p>
                        </div>
                      </Button>
                      <Button
                        className="flex h-auto items-center justify-start gap-3 rounded-lg p-2 hover:bg-muted"
                        variant="ghost"
                      >
                        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                          <picture>
                            <source
                              srcSet="https://avatar.vercel.sh/priya"
                              type="image/png"
                            />
                            <img
                              alt="Priya"
                              className="aspect-square h-full w-full"
                              height={100}
                              src="https://avatar.vercel.sh/priya"
                              width={100}
                            />
                          </picture>
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold">Priya</p>
                          <p className="truncate text-muted-foreground text-sm">
                            Awesome, thanks!
                          </p>
                        </div>
                      </Button>
                      <Button
                        className="flex h-auto items-center justify-start gap-3 rounded-lg p-2 hover:bg-muted"
                        variant="ghost"
                      >
                        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                          <picture>
                            <source
                              srcSet="https://avatar.vercel.sh/john"
                              type="image/png"
                            />
                            <img
                              alt="John"
                              className="aspect-square h-full w-full"
                              height={100}
                              src="https://avatar.vercel.sh/john"
                              width={100}
                            />
                          </picture>
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold">John</p>
                          <p className="truncate text-muted-foreground text-sm">
                            Yeah, I'll be there.
                          </p>
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-r-xl">
                    <div className="flex items-center gap-3 border-b bg-muted/40 p-3 md:rounded-tr-xl md:bg-transparent">
                      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <picture>
                          <source
                            srcSet="https://avatar.vercel.sh/alex"
                            type="image/png"
                          />
                          <img
                            alt="Alex"
                            className="aspect-square h-full w-full"
                            height={100}
                            src="https://avatar.vercel.sh/alex"
                            width={100}
                          />
                        </picture>
                      </span>
                      <div>
                        <p className="font-semibold text-lg">Alex</p>
                        <p className="text-chart-2 text-sm">Online</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6 overflow-y-auto bg-background/50 p-4">
                      <div className="flex items-start gap-3">
                        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <picture>
                            <source
                              srcSet="https://avatar.vercel.sh/alex"
                              type="image/png"
                            />
                            <img
                              alt="Alex"
                              className="aspect-square h-full w-full"
                              height={100}
                              src="https://avatar.vercel.sh/alex"
                              width={100}
                            />
                          </picture>
                        </span>
                        <div className="max-w-xs rounded-lg bg-muted p-3">
                          <p>Hey! Did you see the new landing page?</p>
                          <p className="mt-1 text-right text-muted-foreground text-xs">
                            10:00 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start justify-end gap-3">
                        <div className="max-w-xs rounded-lg bg-primary p-3 text-primary-foreground">
                          <p>
                            Yeah, it looks amazing! The chat preview is a great
                            touch.
                          </p>
                          <p className="mt-1 text-right text-primary-foreground/80 text-xs">
                            10:01 AM
                          </p>
                        </div>
                        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                            <picture>
                              <source
                                srcSet="https://avatar.vercel.sh/you"
                                type="image/png"
                              />
                              <img
                                alt="You"
                                className="aspect-square h-full w-full"
                                height={100}
                                src="https://avatar.vercel.sh/you"
                                width={100}
                              />
                            </picture>
                          </span>
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <picture>
                            <source
                              srcSet="https://avatar.vercel.sh/alex"
                              type="image/png"
                            />
                            <img
                              alt="Alex"
                              className="aspect-square h-full w-full"
                              height={100}
                              src="https://avatar.vercel.sh/alex"
                              width={100}
                            />
                          </picture>
                        </span>
                        <div className="max-w-xs rounded-lg bg-muted p-3">
                          <p>
                            Totally. And it's responsive too. Looks great on my
                            phone.
                          </p>
                          <p className="mt-1 text-right text-muted-foreground text-xs">
                            10:02 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <picture>
                            <source
                              srcSet="https://avatar.vercel.sh/alex"
                              type="image/png"
                            />
                            <img
                              alt="Alex"
                              className="aspect-square h-full w-full"
                              height={100}
                              src="https://avatar.vercel.sh/alex"
                              width={100}
                            />
                          </picture>
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-muted p-2">
                            <div className="flex items-center gap-1">
                              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                              <span className="size-1.5 animate-pulse rounded-full bg-primary delay-200" />
                              <span className="size-1.5 animate-pulse rounded-full bg-primary delay-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t bg-muted/40 p-4 md:rounded-br-xl md:bg-transparent">
                      <div className="relative">
                        <Input
                          className="pr-16"
                          placeholder="Type a message..."
                        />
                        <Button
                          className="-translate-y-1/2 absolute top-1/2 right-2.5"
                          size="icon"
                          variant="ghost"
                        >
                          <Send className="size-5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-muted/40 py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="font-bold text-3xl tracking-tighter md:text-4xl/tight">
                Ready to Dive In?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of users connecting every day. Your next great
                conversation is just a click away.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link to="/">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full border-t py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:grid-cols-2 md:gap-16">
              <div className="flex flex-col items-center space-y-4 text-center md:items-start md:text-left">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Testimonials
                </div>
                <h2 className="font-bold text-3xl tracking-tighter sm:text-4xl md:text-5xl lg:leading-tighter xl:text-[3.4rem] 2xl:text-[3.75rem]">
                  What Our Users Say
                </h2>
                <Link
                  className="inline-flex items-center justify-center font-medium text-primary text-sm underline-offset-4 hover:underline"
                  to="/blogs"
                >
                  Read more on our blog
                </Link>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center md:items-start md:text-left">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Community Feedback
                </div>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  "VynChat is the best chat app I've used. It's incredibly fast,
                  the interface is clean, and I've met so many interesting
                  people."
                </p>
                <p className="font-semibold">— Alex</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-muted-foreground text-xs">
          © 2025 VynChat. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" to="/">
            Terms of Service
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" to="/">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
