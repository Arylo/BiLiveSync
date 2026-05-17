const IPV4_SEGMENT_COUNT = 4;

const toSubnetPrefix = (address: string): string | null => {
  const chunks = address.split('.');
  if (chunks.length !== IPV4_SEGMENT_COUNT) {
    return null;
  }

  return chunks.slice(0, 3).join('.');
};

export const canUploadInLan = (clientIp: string, serverIp: string): boolean => {
  const clientSubnet = toSubnetPrefix(clientIp);
  const serverSubnet = toSubnetPrefix(serverIp);

  return Boolean(clientSubnet && serverSubnet && clientSubnet === serverSubnet);
};
