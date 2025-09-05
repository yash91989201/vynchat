import type React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  priority?: boolean;
}

const BASE_URL = "https://your-image-transformer.coolify.io";

const WIDTH_320 = 320;
const WIDTH_640 = 640;
const WIDTH_960 = 960;
const WIDTH_1200 = 1200;
const WIDTH_1600 = 1600;

const RESPONSIVE_WIDTHS = [
  WIDTH_320,
  WIDTH_640,
  WIDTH_960,
  WIDTH_1200,
  WIDTH_1600,
];
const FALLBACK_WIDTH = 800;

export function Image({
  src,
  alt,
  width,
  height,
  quality = 75,
  sizes = "100vw",
  priority = false,
  ...props
}: ImageProps) {
  if (!src) {
    return null;
  }

  // Generate transformed URL
  const buildUrl = (w: number, format?: string) =>
    `${BASE_URL}${src}?w=${w}&q=${quality}&auto=format${format ? `&fm=${format}` : ""}`;

  // Responsive breakpoints (tweak as needed)
  const widths = RESPONSIVE_WIDTHS;

  // Create srcSets for different formats
  const makeSrcSet = (format?: string) =>
    widths.map((w) => `${buildUrl(w, format)} ${w}w`).join(", ");

  const fallbackSrc = width ? buildUrl(width) : buildUrl(FALLBACK_WIDTH);

  return (
    <picture>
      {/* AVIF for browsers that support it */}
      <source sizes={sizes} srcSet={makeSrcSet("avif")} type="image/avif" />
      {/* WebP as secondary */}
      <source sizes={sizes} srcSet={makeSrcSet("webp")} type="image/webp" />
      {/* Fallback to default format */}
      <img
        alt={alt}
        decoding="async"
        height={height}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        src={fallbackSrc}
        srcSet={makeSrcSet()}
        style={{
          maxWidth: "100%",
          height: "auto",
          ...props.style,
        }}
        width={width}
        {...props}
      />
    </picture>
  );
}
