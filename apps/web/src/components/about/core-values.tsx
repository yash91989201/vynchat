import { Globe, Lightbulb, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CoreValues() {
  const values = [
    {
      icon: <Users className="size-8 text-primary" />,
      title: "Community",
      description:
        "We value human connection and aim to bring people together worldwide.",
    },
    {
      icon: <Globe className="size-8 text-primary" />,
      title: "Global Reach",
      description:
        "Breaking borders to help you chat with anyone, anywhere, anytime.",
    },
    {
      icon: <Lightbulb className="size-8 text-primary" />,
      title: "Innovation",
      description:
        "Constantly improving with modern features like swipe-to-skip & live rooms.",
    },
    {
      icon: <Shield className="size-8 text-primary" />,
      title: "Safety",
      description:
        "Your safety is our top priority — secure chats, moderation, and privacy-first design.",
    },
  ];

  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-0">
        <div className="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
          <h3 className="font-bold text-3xl tracking-tighter sm:text-4xl">
            Our Core Values
          </h3>
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4">
          {values.map((value, i) => (
            <Card key={i.toString()}>
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  {value.icon}
                </div>
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
