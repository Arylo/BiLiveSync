import { randomUUID } from 'node:crypto';

import type { StoredMediaRecord, UploadPayload } from './media.types.js';

export class MediaService {
  public async createLivePhoto(payload: UploadPayload): Promise<StoredMediaRecord> {
    const now = Date.now();
    const mediaId = randomUUID();

    const media: StoredMediaRecord = {
      id: mediaId,
      type: payload.videoPath ? 'live_photo' : 'photo',
      image_url: `/media/${mediaId}/image`,
      thumbnail_url: `/media/${mediaId}/thumbnail?ts=${now}`,
      image_path: payload.imagePath,
      ...(payload.videoPath
        ? {
            video_url: `/media/${mediaId}/video/original`,
            video_compatible_url: `/media/${mediaId}/video/compatible`,
            video_path: payload.videoPath,
            video_compatible_path: `${payload.videoPath}.mp4`
          }
        : {})
    };

    if (payload.videoPath) {
      await this.enqueueTranscode(media.id, payload.videoPath, `${payload.videoPath}.mp4`);
    }

    return media;
  }

  private async enqueueTranscode(mediaId: string, sourcePath: string, targetPath: string): Promise<void> {
    const command = [
      'ffmpeg',
      '-y',
      '-i',
      sourcePath,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-movflags',
      '+faststart',
      targetPath
    ];

    // TODO: push { mediaId, command } to a background worker queue.
    // Keeping no-op placeholder here to preserve async flow in the initial scaffold.
    console.info('enqueueTranscode', { mediaId, command });
  }
}
