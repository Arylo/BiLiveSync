export type ClientPlatform = "ios" | "android" | "desktop" | "web";

export const parsePlatformHeader = (value: string | undefined): ClientPlatform => {
  switch (value) {
    case "ios":
    case "android":
    case "desktop":
    case "web":
      return value;
    default:
      return "web";
  }
};
