import '@elrondnetwork/erdnest/lib/src/utils/extensions/date.extensions';
import { NativeAuthSigner } from '@elrondnetwork/erdnest/lib/src/utils/native.auth.signer';
import { loginWalletWithMaiarId } from './maiar.id.login';

const ELROND_API_DEVNET = 'https://devnet-api.elrond.com';
const ELROND_API_TESTNET = 'https://testnet-api.elrond.com';
const ELROND_API_MAINNET = 'https://api.elrond.com';

const MAIAR_ID_API_DEVNET = 'https://devnet-id.maiar.com/api/v1';
const MAIAR_ID_API_TESTNET = 'https://testnet-id.maiar.com/api/v1';
const MAIAR_ID_API_MAINNET = 'https://id.maiar.com/api/v1';

const EXPIRY_SECONDS_DEFAULT = 60 * 60 * 24;

const loginWalletWithContext = async (
  context: any,
  host: string,
  apiUrl: string,
  expirySeconds: number,
  signerPrivateKeyPath: string,
): Promise<string> => {
  const cacheKey = Buffer.from([host, apiUrl, expirySeconds, signerPrivateKeyPath].join(':')).toString('base64');
  const cacheDataRaw = await context.store.getItem(cacheKey);
  if (cacheDataRaw) {
    const cachedData = JSON.parse(cacheDataRaw);

    const currentDate = new Date().addMinutes(1);
    const expiryDate = new Date(cachedData?.expiryDate);
    if (currentDate <= expiryDate) {
      return cachedData.accessToken;
    }
  }

  const nativeAuthSigner = new NativeAuthSigner({
    host,
    apiUrl,
    expirySeconds,
    signerPrivateKeyPath,
  });
  const nativeAuthToken = await nativeAuthSigner.getToken();

  await context.store.setItem(cacheKey, JSON.stringify(nativeAuthToken));

  return nativeAuthToken.accessToken;
}

export const templateTags = [
  {
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
        displayName: 'Expiry seconds',
        type: 'number',
        defaultValue: EXPIRY_SECONDS_DEFAULT,
        description: 'TTL that will be encoded in the access token. TTL that will be encoded in the access token.'
      },
      {
        displayName: 'PEM Path',
        type: 'string',
        validate: (arg: string) => arg ? '' : 'Required',
      },
    ],
  },
  {
    run: loginWalletWithMaiarId,
    name: 'ElrondMaiarIdAuth',
    displayName: 'Elrond Maiar ID - Auth',
    description: 'Maiar ID authentication - Insomnia plugin',
    args: [
      {
        displayName: 'Maiar ID Api URL',
        type: 'enum',
        validate: (arg: string) => arg ? '' : 'Required',
        defaultValue: MAIAR_ID_API_MAINNET,
        options: [
          {
            displayName: 'Devnet',
            value: MAIAR_ID_API_DEVNET,
          },
          {
            displayName: 'Testnet',
            value: MAIAR_ID_API_TESTNET,
          },
          {
            displayName: 'Mainnet',
            value: MAIAR_ID_API_MAINNET,
          },
        ]
      },
      {
        displayName: 'PEM Path',
        type: 'string',
        validate: (arg: string) => arg ? '' : 'Required',
      },
    ]
  }
];
