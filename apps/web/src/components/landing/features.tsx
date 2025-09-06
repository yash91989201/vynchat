import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronsLeftRight,
  Gauge,
  Image,
  Laptop,
  Radio,
  Shield,
} from "lucide-react";

export function Features() {
  return (
    <section className="m-4 md:m-8 bg-background text-foreground">
      <div className="container mx-auto p-4 my-6 space-y-2 text-center">
        <h2 className="text-5xl font-bold">Why Choose VynChat?</h2>
        <p className="text-muted-foreground">
          A simple, fast, and safe way to connect with people worldwide.
        </p>
      </div>
      <div className="container mx-auto grid justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-col items-center p-4">
            <Radio className="w-8 h-8 text-primary" />
            <CardTitle className="my-3 text-3xl font-semibold">
              Live Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 leading-tight text-center">
            <p>Join trending topics or start your own in seconds.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center p-4">
            <Image className="w-8 h-8 text-primary" />
            <CardTitle className="my-3 text-3xl font-semibold">
              Photo Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 leading-tight text-center">
            <p>Send images instantly with smart moderation.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center p-4">
            <ChevronsLeftRight className="w-8 h-8 text-primary" />
            <CardTitle className="my-3 text-3xl font-semibold">
              Swipe to Skip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 leading-tight text-center">
            <p>Find your vibe faster with our skip feature.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center p-4">
            <Gauge className="w-8 h-8 text-primary" />
            <CardTitle className="my-3 text-3xl font-semibold">
              Light & Fast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 leading-tight text-center">
            <p>Works smoothly even on low networks.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center p-4">
            <Shield className="w-8 h-8 text-primary" />
            <CardTitle className="my-3 text-3xl font-semibold">
              Privacy First
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 leading-tight text-center">
            <p>Minimal data, optional profiles, and clear controls.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center p-4">
            <Laptop className="w-8 h-8 text-primary" />
            <CardTitle className="my-3 text-3xl font-semibold">
              Cross-Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 leading-tight text-center">
            <p>Seamless on mobile, tablet, and desktop.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}