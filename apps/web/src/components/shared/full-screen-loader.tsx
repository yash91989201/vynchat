import { Image } from "@unpic/react";

export function FullScreenLoader() {
  return (
    <div className="fade-in-0 fixed inset-0 z-50 flex animate-in flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Image
          alt="VynChat Logo"
          className="size-32 rounded-2xl"
          layout="fullWidth"
          src="/logo.webp"
        />
        <div className="text-center">
          <p className="font-semibold text-lg text-primary">
            Loading VynChat...
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
}
