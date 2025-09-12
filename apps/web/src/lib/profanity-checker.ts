import type { ProfanityCheckerConfig } from "glin-profanity";
import { checkProfanity as check } from "glin-profanity";

const config: ProfanityCheckerConfig = {
  languages: ["english", "hindi"],
  severityLevels: true,
  autoReplace: true,
  replaceWith: "🤬",
};

export const checkProfanity = (text: string) => {
  return check(text, config);
};
