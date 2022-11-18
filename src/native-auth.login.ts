
import { NativeAuthSigner } from '@elrondnetwork/erdnest/lib/src/utils/native.auth.signer';

export const loginWalletWithContext = async (
  context: any,
  host: string,
  apiUrl: string,
  expirySeconds: number,
  privateKey: string,
): Promise<string> => {
  const cacheKey = Buffer.from([host, apiUrl, expirySeconds, privateKey].join(':')).toString('base64');
  
  const cacheDataRaw = await context.store.getItem(cacheKey);
  if (cacheDataRaw) {
    const cachedData = JSON.parse(cacheDataRaw);

    const currentDate = new Date().addMinutes(1);
    const expiryDate = new Date(cachedData?.expiryDate);
    if (currentDate <= expiryDate) {
      return cachedData.token;
    }
  }

  const nativeAuthSigner = new NativeAuthSigner({
    host,
    apiUrl,
    expirySeconds,
    privateKey,
  });
  const nativeAuthToken = await nativeAuthSigner.getToken();

  await context.store.setItem(cacheKey, JSON.stringify(nativeAuthToken));

  return nativeAuthToken.token;
}
