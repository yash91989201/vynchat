import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="font-bold text-3xl tracking-tighter md:text-4xl/tight">
            Ready to Start Chatting?
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Join thousands already connecting worldwide. Sign up now and start
            chatting in seconds.
          </p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-2 min-[400px]:flex-row">
          <Link
            className={cn(
              buttonVariants(),
              "inline-flex h-10 items-center justify-center rounded-md px-8 font-medium text-sm shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            )}
            to="/chat"
          >
            Get Started
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 font-medium text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            )}
            to="/about"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
