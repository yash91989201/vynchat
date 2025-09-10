export const generateName = () => {
  const adjectives = [
    "Happy",
    "Lucky",
    "Bright",
    "Swift",
    "Cool",
    "Smart",
    "Kind",
    "Bold",
    "Calm",
    "Quick",
    "Wise",
    "Pure",
    "Wild",
    "Free",
    "Noble",
    "Brave",
    "Sharp",
    "Clear",
    "Warm",
    "Fresh",
  ];

  const nouns = [
    "Tiger",
    "Eagle",
    "Wolf",
    "Fox",
    "Bear",
    "Lion",
    "Hawk",
    "Dolphin",
    "Falcon",
    "Panther",
    "Owl",
    "Shark",
    "Phoenix",
    "Dragon",
    "Raven",
    "Lynx",
    "Jaguar",
    "Cobra",
    "Stallion",
    "Cheetah",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);

  return `${randomAdjective}${randomNoun}${randomNumber}`;
};
