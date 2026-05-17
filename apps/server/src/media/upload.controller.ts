import type { UploadMediaResponse } from "@bilivesync/shared-api";

import { MediaService } from "./media.service.js";

export interface MultipartUpload {
  image: { filepath: string };
  video?: { filepath: string };
  album_id: string;
}

export class UploadController {
  public constructor(private readonly mediaService: MediaService) {}

  public async upload(form: MultipartUpload): Promise<UploadMediaResponse> {
    const media = await this.mediaService.createLivePhoto({
      albumId: form.album_id,
      imagePath: form.image.filepath,
      ...(form.video?.filepath ? { videoPath: form.video.filepath } : {}),
    });

    return { media };
  }
}
