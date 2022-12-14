
import { NativeAuthSigner } from '@elrondnetwork/erdnest/lib/src/utils/native.auth.signer';

export const loginWalletWithContext = async (
  context: any,
  host: string,
  apiUrl: string,
  shard: string,
  expirySeconds: number,
  privateKey: string,
): Promise<string> => {
  let blockHashShard: number | undefined = undefined;
  if (shard !== '-') {
    blockHashShard = parseInt(shard);
  }

  const args = [host, apiUrl, expirySeconds, privateKey, blockHashShard];
  console.log(args);

  const cacheKey = Buffer.from(args.join(':')).toString('base64');

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
    blockHashShard,
  });

  const nativeAuthToken = await nativeAuthSigner.getToken();

  await context.store.setItem(cacheKey, JSON.stringify(nativeAuthToken));

  return nativeAuthToken.token;
}
