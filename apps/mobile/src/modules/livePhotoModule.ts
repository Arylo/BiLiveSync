import { NativeModules } from "react-native";

export interface ShareLivePhotoRequest {
  imagePath: string;
  videoPath: string;
  fallbackImagePath: string;
  previewLink: string;
}

interface LivePhotoModule {
  saveLivePhotoToLibrary(imagePath: string, videoPath: string): Promise<void>;
  presentShareSheet(request: ShareLivePhotoRequest): Promise<{ dynamicShared: boolean }>;
}

const moduleValue = NativeModules.LivePhotoModule as LivePhotoModule | undefined;

if (!moduleValue) {
  throw new Error("LivePhotoModule is not linked.");
}

export const livePhotoModule = moduleValue;
