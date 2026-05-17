import type { MediaItem } from "@bilivesync/shared-api";

export interface LivePhotoPreviewProps {
  media: MediaItem;
  isPressing: boolean;
}

export const getDesktopLivePhotoSources = ({
  media,
  isPressing,
}: LivePhotoPreviewProps): {
  imageUrl: string;
  videoUrl: string | null;
} => ({
  imageUrl: media.image_url,
  videoUrl: isPressing ? (media.video_compatible_url ?? media.video_url ?? null) : null,
});
