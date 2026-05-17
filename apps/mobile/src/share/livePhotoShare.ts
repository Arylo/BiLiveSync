import WeChat from "react-native-wechat-lib";

import { livePhotoModule, type ShareLivePhotoRequest } from "../modules/livePhotoModule";

const reportDynamicShareFailure = (error: unknown): void => {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Dynamic Live Photo share failed; falling back to static share.", error);
  }
};

export const shareLivePhoto = async (request: ShareLivePhotoRequest): Promise<void> => {
  try {
    const result = await livePhotoModule.presentShareSheet(request);

    if (result.dynamicShared) {
      return;
    }
  } catch (error) {
    reportDynamicShareFailure(error);
  }

  await WeChat.shareImage({
    imageUrl: `file://${request.fallbackImagePath}`,
    scene: 0,
  });
};
