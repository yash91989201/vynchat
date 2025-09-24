export const generateSlug = (value: string) => {
  return (
    value
      .toLowerCase()
      // replace spaces and underscores with hyphens
      .replace(/[_\s]+/g, "-")
      // remove invalid characters (keep a-z, 0-9 and -)
      .replace(/[^a-z0-9-]/g, "")
      // collapse multiple hyphens
      .replace(/-+/g, "-")
      // trim leading/trailing hyphens
      .replace(/^-|-$/g, "")
  );
};

