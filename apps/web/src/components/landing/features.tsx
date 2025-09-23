import {
  ChevronsLeftRight,
  Image,
  Laptop,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: <Users className="size-8 text-primary" />,
      title: "Multiple Chat Modes",
      description: "Talk to strangers, join chat rooms, or message followers.",
    },
    {
      icon: <Image className="size-8 text-primary" />,
      title: "Rich Media Sharing",
      description: "Share photos, videos, and audio in any conversation.",
    },
    {
      icon: <ChevronsLeftRight className="size-8 text-primary" />,
      title: "Region Matching",
      description: "Connect with people from specific continents or worldwide.",
    },
    {
      icon: <MessageSquare className="size-8 text-primary" />,
      title: "Follow System",
      description: "Follow users you like to start direct messaging anytime.",
    },
    {
      icon: <Shield className="size-8 text-primary" />,
      title: "Room Management",
      description: "Create, lock, and moderate your own chat rooms.",
    },
    {
      icon: <Laptop className="size-8 text-primary" />,
      title: "Real-Time Experience",
      description: "Typing indicators, instant media preview, and emoji picker.",
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
