import { createFileRoute } from "@tanstack/react-router";
import { CoreValues } from "@/components/about/core-values";
import { AboutHero } from "@/components/about/hero";
import { MissionVision } from "@/components/about/mission-vision";

export const Route = createFileRoute("/(public)/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="bg-background text-foreground">
      <AboutHero />
      <MissionVision />
      <CoreValues />
    </main>
  );
}
