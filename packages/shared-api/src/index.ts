export interface MediaItem {
  id: string;
  type: "live_photo" | "photo" | "video";
  image_url: string;
  video_url?: string;
  video_compatible_url?: string;
  thumbnail_url: string;
  duration?: number;
}

export interface UploadMediaRequest {
  album_id: string;
}

export interface UploadMediaResponse {
  media: MediaItem;
}
