import {
  ChevronsLeftRight,
  Gauge,
  Image,
  Laptop,
  Radio,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: <Radio className="size-8 text-primary" />,
      title: "Live Rooms",
      description: "Join trending topics or start your own in seconds.",
    },
    {
      icon: <Image className="size-8 text-primary" />,
      title: "Photo Sharing",
      description: "Send images instantly with smart moderation.",
    },
    {
      icon: <ChevronsLeftRight className="size-8 text-primary" />,
      title: "Skip to next stranger",
      description: "Find your vibe faster with our skip feature.",
    },
    {
      icon: <Gauge className="size-8 text-primary" />,
      title: "Light & Fast",
      description: "Works smoothly even on low networks.",
    },
    {
      icon: <Shield className="size-8 text-primary" />,
      title: "Privacy First",
      description: "Minimal data, optional profiles, and clear controls.",
    },
    {
      icon: <Laptop className="size-8 text-primary" />,
      title: "Cross-Platform",
      description: "Seamless on mobile, tablet, and desktop.",
    },
  ];

  return (
    <section className="bg-primary/5 py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="inline-block rounded-full bg-muted px-3 py-1.5 text-sm">
            Key Features
          </div>
          <h2 className="font-bold text-3xl tracking-tighter sm:text-5xl">
            Why Choose VynChat?
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            A simple, fast, and safe way to connect with people worldwide.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card className="h-full" key={i.toString()}>
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
