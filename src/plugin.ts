const ELROND_API_DEVNET = 'devnet-api.elrond.com';
const ELROND_API_TESTNET = 'testnet-api.elrond.com';
const ELROND_API_MAINNET = 'api.elrond.com';
const EXPIRY_SECONDS_DEFAULT = 60 * 60 * 24;

const loginWalletWithContext = async (
  context: any,
  host: string,
  apiUrl: string,
  expirySeconds: number,
  pemPath: string,
): Promise<string> => {
  // TODO restore cached values

  const res = JSON.stringify({
    context,
    host,
    apiUrl,
    expirySeconds,
    pemPath,
  }, null, 4);
  return res;
}

export const templateTags = [
  {
    run: loginWalletWithContext,
    name: 'ElrondNativeAuth',
    displayName: 'Elrond Native-Auth',
    description: 'Insomnia plugin to authenticate via Elrond Native-Auth',
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
];
