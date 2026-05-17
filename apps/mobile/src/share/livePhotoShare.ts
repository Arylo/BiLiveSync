import WeChat from 'react-native-wechat-lib';

import { livePhotoModule, type ShareLivePhotoRequest } from '../modules/livePhotoModule';

export const shareLivePhoto = async (request: ShareLivePhotoRequest): Promise<void> => {
  try {
    const result = await livePhotoModule.presentShareSheet(request);

    if (result.dynamicShared) {
      return;
    }
  } catch {
    // fall through to static share
  }

  await WeChat.shareImage({
    imageUrl: `file://${request.fallbackImagePath}`,
    scene: 0
  });
};
