
import '@elrondnetwork/erdnest/lib/src/utils/extensions/date.extensions';
import { NativeAuthSigner } from '@elrondnetwork/erdnest/lib/src/utils/native.auth.signer';

const ELROND_API_DEVNET = 'https://devnet-api.elrond.com';
const ELROND_API_TESTNET = 'https://testnet-api.elrond.com';
const ELROND_API_MAINNET = 'https://api.elrond.com';


const SHARD_0 = '0';
const SHARD_1 = '1';
const SHARD_2 = '2';
const SHARD_METACHAIN = '4294967295';

const EXPIRY_SECONDS_DEFAULT = 60 * 60 * 24;

const loginWalletWithContext = async (
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

export default {
  run: loginWalletWithContext,
  name: 'ElrondNativeAuth',
  displayName: 'Elrond Native-Auth',
  description: 'Native authentication - Insomnia plugin',
  args: [
    {
      displayName: 'Host',
      type: 'string',
      validate: (arg: string) => arg ? '' : 'Required',
      description: 'The server-side component will validate the `origin` header, which must match with the provided host in the client-side configuration'
    },
    {
      displayName: 'Elrond Api URL',
      type: 'enum',
      validate: (arg: string) => arg ? '' : 'Required',
      defaultValue: ELROND_API_MAINNET,
      description: 'The endpoint from where the current block information will be fetched upon initialization.',
      options: [
        {
          displayName: 'Devnet',
          value: ELROND_API_DEVNET,
        },
        {
          displayName: 'Testnet',
          value: ELROND_API_TESTNET,
        },
        {
          displayName: 'Mainnet',
          value: ELROND_API_MAINNET,
        },
      ]
    },
    {
      displayName: 'Blockchain shard',
      type: 'enum',
      defaultValue: '-',
      validate: (arg: string) => arg ? '' : 'Required',
      description: 'Shard from which it will be fetched the latest block',
      options: [
        {
          displayName: '-',
          value: '-',
        },
        {
          displayName: 'Shard 0',
          value: SHARD_0,
        },
        {
          displayName: 'Shard 1',
          value: SHARD_1,
        },
        {
          displayName: 'Shard 2',
          value: SHARD_2,
        },
        {
          displayName: 'Metachain',
          value: SHARD_METACHAIN,
        },
      ]
    },
    {
      displayName: 'Expiry seconds',
      type: 'number',
      defaultValue: EXPIRY_SECONDS_DEFAULT,
      description: 'TTL that will be encoded in the access token. TTL that will be encoded in the access token.'
    },
    {
      displayName: 'PEM Content',
      type: 'string',
      validate: (arg: string) => arg ? '' : 'Required',
    },
  ],
};