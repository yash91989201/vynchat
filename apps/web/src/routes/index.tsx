import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col min-h-[100dvh]">
			<main className="flex-1">
				<section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/5 blur-3xl -z-10" />
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
							<div className="flex flex-col justify-center items-center text-center lg:items-start lg:text-left space-y-4">
								<div className="space-y-2">
									<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">
										Connect Instantly. Chat Freely.
									</h1>
									<p className="max-w-[600px] text-muted-foreground md:text-xl">
										VynChat is a modern chat application that lets you connect
										with people from around the world in real-time.
									</p>
								</div>
								<div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
									<Button size="lg" asChild>
										<Link to="/chat">Start Chatting</Link>
									</Button>
									<Button size="lg" variant="outline" asChild>
										<Link to="/#features">Learn More</Link>
									</Button>
								</div>
							</div>
							<img
								src="/logo.png"
								alt="Hero"
								className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square animate-in fade-in zoom-in-50 duration-1000"
							/>
						</div>
					</div>
				</section>

				<section
					id="features"
					className="w-full py-12 md:py-24 lg:py-32 bg-muted/40"
				>
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
									Key Features
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
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
									<h3 className="text-xl font-bold">Live Rooms</h3>
								</div>
								<p className="text-muted-foreground">
									Join trending topics or create your own public/private rooms in
									seconds.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex items-center justify-center gap-2">
									<Zap className="size-8 text-primary" />
									<h3 className="text-xl font-bold">Blazing Fast</h3>
								</div>
								<p className="text-muted-foreground">
									Our lightweight app works smoothly even on slower networks.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex items-center justify-center gap-2">
									<Repeat className="size-8 text-primary" />
									<h3 className="text-xl font-bold">Swipe to Skip</h3>
								</div>
								<p className="text-muted-foreground">
									Quickly find conversations that match your vibe.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex items-center justify-center gap-2">
									<Shield className="size-8 text-primary" />
									<h3 className="text-xl font-bold">Privacy First</h3>
								</div>
								<p className="text-muted-foreground">
									Minimal data collection, optional profiles, and robust privacy
									controls.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex items-center justify-center gap-2">
									<Smartphone className="size-8 text-primary" />
									<h3 className="text-xl font-bold">Cross-Platform</h3>
								</div>
								<p className="text-muted-foreground">
									Enjoy a seamless experience on mobile, tablet, and desktop.
								</p>
							</div>
							<div className="grid gap-1 text-center">
								<div className="flex items-center justify-center gap-2">
									<BadgeCheck className="size-8 text-primary" />
									<h3 className="text-xl font-bold">Photo Sharing</h3>
								</div>
								<p className="text-muted-foreground">
									Instantly share images with smart, built-in content
									moderation.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 lg:py-32 bg-background">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="space-y-2">
								<div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
									Live Preview
								</div>
								<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
									See VynChat in Action
								</h2>
								<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
									Our interface is designed to be intuitive, responsive, and
									beautiful. Here's a sneak peek.
								</p>
							</div>
						</div>
						<div className="relative mt-12">
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl h-3/4 bg-primary/10 blur-3xl -z-10" />
							<div className="mx-auto max-w-md md:max-w-4xl rounded-xl border bg-card text-card-foreground shadow-2xl shadow-primary/10">
								<div className="grid grid-cols-1 md:grid-cols-[260px_1fr] h-[550px]">
									<div className="hidden md:flex flex-col border-r bg-muted/40 rounded-l-xl">
										<div className="p-4">
											<div className="relative">
												<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													placeholder="Search"
													className="pl-8 w-full bg-background"
												/>
											</div>
										</div>
										<div className="flex flex-col gap-1 p-2">
											<Button
												variant="ghost"
												className="flex items-center gap-3 justify-start p-2 h-auto rounded-lg bg-primary/10"
											>
												<span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
													<img
														className="aspect-square h-full w-full"
														src="https://avatar.vercel.sh/alex"
														alt="Alex"
													/>
												</span>
												<div className="flex-1 text-left">
													<p className="font-semibold">Alex</p>
													<p className="text-sm text-muted-foreground truncate">
														Typing...
													</p>
												</div>
											</Button>
											<Button
												variant="ghost"
												className="flex items-center gap-3 justify-start p-2 h-auto rounded-lg hover:bg-muted"
											>
												<span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
													<img
														className="aspect-square h-full w-full"
														src="https://avatar.vercel.sh/priya"
														alt="Priya"
													/>
												</span>
												<div className="flex-1 text-left">
													<p className="font-semibold">Priya</p>
													<p className="text-sm text-muted-foreground truncate">
														Awesome, thanks!
													</p>
												</div>
											</Button>
											<Button
												variant="ghost"
												className="flex items-center gap-3 justify-start p-2 h-auto rounded-lg hover:bg-muted"
											>
												<span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
													<img
														className="aspect-square h-full w-full"
														src="https://avatar.vercel.sh/john"
														alt="John"
													/>
												</span>
												<div className="flex-1 text-left">
													<p className="font-semibold">John</p>
													<p className="text-sm text-muted-foreground truncate">
														Yeah, I'll be there.
													</p>
												</div>
											</Button>
										</div>
									</div>
									<div className="flex flex-col rounded-r-xl">
										<div className="p-3 border-b flex items-center gap-3 bg-muted/40 md:bg-transparent md:rounded-tr-xl">
											<span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
												<img
													className="aspect-square h-full w-full"
													src="https://avatar.vercel.sh/alex"
													alt="Alex"
												/>
											</span>
											<div>
												<p className="font-semibold text-lg">Alex</p>
												<p className="text-sm text-chart-2">Online</p>
											</div>
										</div>
										<div className="flex-1 p-4 space-y-6 overflow-y-auto bg-background/50">
											<div className="flex items-start gap-3">
												<span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
													<img
														className="aspect-square h-full w-full"
														src="https://avatar.vercel.sh/alex"
														alt="Alex"
													/>
												</span>
												<div className="p-3 rounded-lg bg-muted max-w-xs">
													<p>Hey! Did you see the new landing page?</p>
													<p className="text-xs text-muted-foreground mt-1 text-right">
														10:00 AM
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3 justify-end">
												<div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-xs">
													<p>
														Yeah, it looks amazing! The chat preview is a
														great touch.
													</p>
													<p className="text-xs text-primary-foreground/80 mt-1 text-right">
														10:01 AM
													</p>
												</div>
												<span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
													<img
														className="aspect-square h-full w-full"
														src="https://avatar.vercel.sh/you"
														alt="You"
													/>
												</span>
											</div>
											<div className="flex items-start gap-3">
												<span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
													<img
														className="aspect-square h-full w-full"
														src="https://avatar.vercel.sh/alex"
														alt="Alex"
													/>
												</span>
												<div className="p-3 rounded-lg bg-muted max-w-xs">
													<p>
														Totally. And it's responsive too. Looks great on
														my phone.
													</p>
													<p className="text-xs text-muted-foreground mt-1 text-right">
														10:02 AM
													</p>
												</div>
											</div>
											<div className="flex items-start gap-3">
												<span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
													<img
														className="aspect-square h-full w-full"
														src="https://avatar.vercel.sh/alex"
														alt="Alex"
													/>
												</span>
												<div className="flex items-center gap-2">
													<div className="p-2 rounded-lg bg-muted">
														<div className="flex items-center gap-1">
															<span className="size-1.5 rounded-full bg-primary animate-pulse" />
															<span className="size-1.5 rounded-full bg-primary animate-pulse delay-200" />
															<span className="size-1.5 rounded-full bg-primary animate-pulse delay-400" />
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="p-4 border-t bg-muted/40 md:bg-transparent md:rounded-br-xl">
											<div className="relative">
												<Input
													placeholder="Type a message..."
													className="pr-16"
												/>
												<Button
													variant="ghost"
													size="icon"
													className="absolute top-1/2 right-2.5 -translate-y-1/2"
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

				<section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
					<div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
						<div className="space-y-3">
							<h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
								Ready to Dive In?
							</h2>
							<p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								Join thousands of users connecting every day. Your next great
								conversation is just a click away.
							</p>
						</div>
						<div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
							<Button size="lg" asChild>
								<Link to="/chat">Get Started</Link>
							</Button>
							<Button size="lg" variant="outline" asChild>
								<Link to="/#features">Learn More</Link>
							</Button>
						</div>
					</div>
				</section>

				<section className="w-full py-12 md:py-24 lg:py-32 border-t">
					<div className="container px-4 md:px-6">
						<div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
							<div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4">
								<div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
									Testimonials
								</div>
								<h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
									What Our Users Say
								</h2>
								<Link
									to="/blog"
									className="inline-flex items-center justify-center text-sm font-medium text-primary underline-offset-4 hover:underline"
								>
									Read more on our blog
								</Link>
							</div>
							<div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4">
								<div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
									Community Feedback
								</div>
								<p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
									"VynChat is the best chat app I've used. It's incredibly
									fast, the interface is clean, and I've met so many
									interesting people."
								</p>
								<p className="font-semibold">— Alex</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
				<p className="text-xs text-muted-foreground">
					© 2025 VynChat. All rights reserved.
				</p>
				<nav className="sm:ml-auto flex gap-4 sm:gap-6">
					<Link to="#" className="text-xs hover:underline underline-offset-4">
						Terms of Service
					</Link>
					<Link to="#" className="text-xs hover:underline underline-offset-4">
						Privacy
					</Link>
				</nav>
			</footer>
		</div>
	);
}

