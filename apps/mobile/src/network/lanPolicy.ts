const IPV4_SEGMENT_COUNT = 4;

const toSubnetPrefix = (address: string, subnetSegmentCount: number): string | null => {
  const chunks = address.split(".");
  if (chunks.length !== IPV4_SEGMENT_COUNT) {
    return null;
  }

  return chunks.slice(0, subnetSegmentCount).join(".");
};

export const canUploadInLan = (
  clientIp: string,
  serverIp: string,
  subnetSegmentCount = 3,
): boolean => {
  const clientSubnet = toSubnetPrefix(clientIp, subnetSegmentCount);
  const serverSubnet = toSubnetPrefix(serverIp, subnetSegmentCount);

  return Boolean(clientSubnet && serverSubnet && clientSubnet === serverSubnet);
};
