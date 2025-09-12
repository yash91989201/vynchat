import { createFileRoute } from "@tanstack/react-router";
import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { AgeWarningDialog } from "@/components/user/age-warning-dialog";

export const Route = createFileRoute("/(public)/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AgeWarningDialog />

      <main className="bg-background text-foreground">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
    </>
  );
}
