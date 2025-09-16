import { Adsense } from "@ctrl/react-adsense";
import { env } from "@/env";
import { useIsMobile } from "@/hooks/use-mobile";

export const AbsoluteLeftAd = () => {
  const isMobile = useIsMobile(1024);
  if (isMobile) return null;

  return (
    <Adsense
      className="-translate-y-1/2 absolute top-1/2 left-0 h-[75vh] w-36"
      client={env.VITE_AD_SENSE_CLIENT}
      slot={env.VITE_AD_SENSE_SLOT}
    />
  );
};

export const AbsoluteRightAd = () => {
  const isMobile = useIsMobile(1024);
  if (isMobile) return null;

  return (
    <Adsense
      className="-translate-y-1/2 absolute top-1/2 right-0 h-[75vh] w-36"
      client={env.VITE_AD_SENSE_CLIENT}
      slot={env.VITE_AD_SENSE_SLOT}
    />
  );
};

export const FooterAd = () => {
  return (
    <Adsense
      className="h-40 w-full"
      client={env.VITE_AD_SENSE_CLIENT}
      format="auto"
      slot={env.VITE_AD_SENSE_SLOT}
    />
  );
};
