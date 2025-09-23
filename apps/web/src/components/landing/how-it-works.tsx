import {
  CheckCircle2,
  MessageCircle,
  PanelLeftClose,
  Users,
} from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Choose Your Mode",
      description: "Talk to strangers, join chat rooms, or message followers.",
      icon: Users,
    },
    {
      step: 2,
      title: "Connect Instantly",
      description:
        "Chat, share media, and use emoji in real-time conversations.",
      icon: MessageCircle,
    },
    {
      step: 3,
      title: "Build Your Network",
      description: "Follow users you like to chat with them again anytime.",
      icon: PanelLeftClose,
    },
  ];

  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto flex flex-col items-center px-6 text-center">
        <h2 className="font-extrabold text-4xl tracking-tight md:text-5xl">
          How It Works
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Getting started with <span className="font-semibold">VynChat</span> is
          simple. Just follow these three steps.
        </p>

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div
              className="relative flex flex-col items-center rounded-2xl border bg-card p-8 shadow-sm transition hover:shadow-md"
              key={step.step}
            >
              {/* Step Number */}
              <div className="-top-6 absolute flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-lg">
                {step.step}
              </div>

              {/* Icon */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <step.icon className="h-7 w-7 text-primary" />
              </div>

              {/* Title & Description */}
              <h3 className="font-semibold text-xl">{step.title}</h3>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Completion indicator (optional, adds polish) */}
        <div className="mt-16 flex items-center gap-3 text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="text-sm">You're ready to start chatting!</span>
        </div>
      </div>
    </section>
  );
}
