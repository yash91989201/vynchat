export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: string;
  quality: string;
}) {
  const isLocal = !src.startsWith("http");
  const query = new URLSearchParams();

  const imageOptimizationApi = "http://localhost:35912";
  const baseUrl = "http://localhost:3001";

  const fullSrc = `${baseUrl}${src}`;

  if (width) {
    query.set("width", width);
  }
  if (quality) {
    query.set("quality", quality);
  }

  if (isLocal && process.env.NODE_ENV === "development") {
    return src;
  }

  if (isLocal) {
    return `${imageOptimizationApi}/image/${fullSrc}?${query.toString()}`;
  }

  return `${imageOptimizationApi}/image/${src}?${query.toString()}`;
}
