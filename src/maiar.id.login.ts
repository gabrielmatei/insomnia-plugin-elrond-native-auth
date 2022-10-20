import axios from "axios";
import { UserSigner } from '@elrondnetwork/erdjs-walletcore/out';
import { SignableMessage } from "@elrondnetwork/erdjs/out";
const fs = require("fs/promises");
import jwt_decode from "jwt-decode";

const getLoginTokenFromMaiarId = async (maiarIdUrl: string) => {
  const { data } = await axios.post(`${maiarIdUrl}/login/init`, {});
  return data.loginToken;
}

const getJwt = async (maiarIdUrl: string, signerPrivateKeyPath: string) => {
  try {
    const loginToken = await getLoginTokenFromMaiarId(maiarIdUrl);

    const pemFile = await fs.readFile(signerPrivateKeyPath).then(content=>content.toString());
    const pemKey = pemFile.toString();
    const userSigner = UserSigner.fromPem(pemKey);

    const userAddress = userSigner.getAddress().bech32();
    
    const messageToSign = userAddress + loginToken + JSON.stringify({});
    const message = new SignableMessage({
      message: Buffer.from(messageToSign)
    });
    await userSigner.sign(message);

    const { data } = await axios.post(`${maiarIdUrl}/login`, {
      address: userAddress,
      loginToken,
      signature: message.getSignature().hex(),
      data: {}
    });

    return data.accessToken;
  } catch (error) {
    throw error
  }
}

export const loginWalletWithMaiarId = async (
  context: any,
  maiarIdUrl: string,
  signerPrivateKeyPath: string,
): Promise<string> => {
  const cacheKey = Buffer.from([maiarIdUrl, signerPrivateKeyPath].join(':')).toString('base64');
  const cacheDataRaw = await context.store.getItem(cacheKey);
  if (cacheDataRaw) {
    const cachedData = JSON.parse(cacheDataRaw);
    const currentDate = new Date().addMinutes(1);
    const expiryDate = new Date(cachedData?.expiryDate);

    if (currentDate <= expiryDate) {
      return cachedData.accessToken;
    }
  }

  const jwt = await getJwt(maiarIdUrl, signerPrivateKeyPath);

  const decoded = jwt_decode<any>(jwt);

  await context.store.setItem(cacheKey, JSON.stringify({
    accessToken: jwt,
    expiryDate: decoded.exp * 1000
  }));

  return jwt;
}

