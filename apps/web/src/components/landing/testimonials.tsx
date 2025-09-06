
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-4xl font-bold">What users say</h2>
          <p className="text-muted-foreground max-w-2xl">
            Here's what our users have to say about VynChat.
          </p>
        </div>
        <div className="grid gap-6 my-16 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p>“Best chat app—super smooth and fun.”</p>
              <div className="flex items-center mt-4 space-x-4">
                <div>
                  <p className="text-lg font-semibold">- Alex</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p>“Feels like meeting new people every day.”</p>
              <div className="flex items-center mt-4 space-x-4">
                <div>
                  <p className="text-lg font-semibold">- Priya</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p>“Swipe feature is unique. I’m hooked!”</p>
              <div className="flex items-center mt-4 space-x-4">
                <div>
                  <p className="text-lg font-semibold">- John</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
