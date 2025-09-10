import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MissionVision() {
  return (
    <section className="bg-primary/5 py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-0">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build delightful, performant chat experiences focused on
                  accessibility and mobile-first UX. We believe in breaking
                  barriers and helping people connect effortlessly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be the most trusted chat platform worldwide — where
                  conversations are safe, seamless, and engaging, powered by
                  innovation and community-first values.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative size-80 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Users className="size-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
