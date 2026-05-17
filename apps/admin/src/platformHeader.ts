export type PlatformHeader = 'ios' | 'android' | 'desktop' | 'web';

export const createPlatformHeader = (platform: PlatformHeader): Record<'X-Platform', PlatformHeader> => ({
  'X-Platform': platform
});
