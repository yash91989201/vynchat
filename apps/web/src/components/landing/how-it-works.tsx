import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function HowItWorks() {
  return (
    <section className="bg-background p-6 text-foreground">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="font-bold text-4xl">How it works</h2>
        </div>
        <div className="my-16 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
                1
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-2xl">Pick a Room</h3>
              <p>Choose a topic or join what’s trending.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
                2
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-2xl">Say Hi</h3>
              <p>Chat, share photos, and make friends.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
                3
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-2xl">Swipe if Needed</h3>
              <p>Not your vibe? Swipe and move on.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

