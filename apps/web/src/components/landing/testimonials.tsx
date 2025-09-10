import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  const testimonials = [
    {
      name: "Alex",
      testimonial: "“Best chat app—super smooth and fun.”",
    },
    {
      name: "Priya",
      testimonial: "“Feels like meeting new people every day.”",
    },
    {
      name: "John",
      testimonial: "“Swipe feature is unique. I’m hooked!”",
    },
  ];

  return (
    <section className="bg-primary/5 py-12 md:py-24">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 text-center md:px-0">
        <div className="space-y-3">
          <h2 className="font-bold text-3xl tracking-tighter md:text-4xl/tight">
            What Our Users Say
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Here's what our users have to say about VynChat.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <Card key={i.toString()}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-lg italic">{testimonial.testimonial}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <p className="font-semibold text-sm">
                    &minus; {testimonial.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
