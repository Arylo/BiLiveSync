const IMAGE_EXTENSIONS = new Set(["heic", "jpg", "jpeg"]);
const VIDEO_EXTENSIONS = new Set(["mov", "mp4"]);

export const isImageFile = (filename: string): boolean => {
  if (!filename.includes(".")) {
    return false;
  }
  const extension = filename.split(".").pop()?.toLowerCase();
  return Boolean(extension && IMAGE_EXTENSIONS.has(extension));
};

export const isVideoFile = (filename: string): boolean => {
  if (!filename.includes(".")) {
    return false;
  }
  const extension = filename.split(".").pop()?.toLowerCase();
  return Boolean(extension && VIDEO_EXTENSIONS.has(extension));
};

export const buildMediaStorageName = (mediaId: string, extension: string): string =>
  `${mediaId}.${extension.toLowerCase()}`;
