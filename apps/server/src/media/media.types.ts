import type { MediaItem } from "@bilivesync/shared-api";

export interface UploadPayload {
  albumId: string;
  imagePath: string;
  videoPath?: string;
}

export interface StoredMediaRecord extends MediaItem {
  image_path: string;
  video_path?: string;
  video_compatible_path?: string;
}
