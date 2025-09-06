import { Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto flex flex-col justify-center py-6 sm:py-12 lg:flex-row lg:justify-between lg:py-24">
        <div className="flex flex-col justify-center rounded-sm text-center lg:max-w-md lg:text-left xl:max-w-xl">
          <h1 className="font-bold text-5xl leading-none sm:text-6xl">
            Chat. Connect.
            <span className="text-primary"> Instantly.</span>
          </h1>
          <p className="mt-6 mb-8 text-lg sm:mb-12">
            VynChat lets you join live rooms, share photos, and connect with
            people across the globe — all in a fast, fun, and safe environment.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-center sm:space-x-4 sm:space-y-0 lg:justify-start">
            <Link to="/chat">
              <Button className="rounded bg-primary px-8 py-3 font-semibold text-lg text-primary-foreground">
                Start Chatting
              </Button>
            </Link>
            <Link to="/blogs">
              <Button
                className="rounded border px-8 py-3 font-semibold text-lg"
                variant="outline"
              >
                Explore Blog
              </Button>
            </Link>
          </div>
          <div className="flex justify-center space-x-4 pt-4 lg:justify-start">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No signup needed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Swipe to skip</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Photo sharing</span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center lg:mt-0">
          <Card className="w-lg">
            <CardHeader>
              <CardTitle className="font-bold text-xl">Chat Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="rounded-lg bg-muted p-3">
                    hey! where are you from?
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <div className="flex-1 text-right">
                  <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                    India you?
                  </div>
                </div>
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-background" />
              </div>
              <div className="flex space-x-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="rounded-lg bg-muted p-3">
                    EU! let’s join the music room 🎶
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

