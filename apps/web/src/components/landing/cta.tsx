import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="bg-primary py-6 text-primary-foreground">
      <div className="container mx-auto flex flex-col items-center justify-center space-y-8 p-4 md:p-10 md:px-24 xl:px-48">
        <h2 className="text-center font-bold text-5xl leading-tight">
          Ready to start chatting?
        </h2>
        <p className="text-center text-xl">
          Join thousands already connecting worldwide.
        </p>
        <div className="flex flex-wrap justify-center">
          <Link to="/chat">
            <Button
              className="m-2 rounded px-8 py-3 font-semibold text-lg"
              variant="secondary"
            >
              Get Started
            </Button>
          </Link>
          <Link to="/about">
            <Button
              className="m-2 rounded border border-primary-foreground px-8 py-3 text-lg text-primary-foreground"
              variant="outline"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
