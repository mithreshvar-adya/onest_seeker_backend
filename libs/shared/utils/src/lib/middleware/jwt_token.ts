// @ts-nocheck
// import { BuyerAppConfig } from "@adya/shared";
import jwt from 'jsonwebtoken';
import * as config from 'config';


// const appConfig: BuyerAppConfig = config.get('seeker.backend_application');
// const JWT_SECRET = appConfig.JWT_SECRET;
const JWT_SECRET = "secret";

class JsonWebToken {
  sign(token: { exp: string; payload: any }): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = { expiresIn: token.exp };
      jwt.sign(token.payload, JWT_SECRET, options, (err, encodedToken) => {
        if (err) {
          reject(err);
        } else {
          resolve(encodedToken!);
        }
      });
    });
  }

  verify(jwtToken: any): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(jwtToken, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
          resolve(false);
        } else {
          resolve(decoded!);
        }
      });
    });
  }

  async checkExpiry(jwtToken: any): Promise<boolean> {
    const decodedToken = jwt.decode(jwtToken, { complete: true }) as { payload: any } | null;
    if (!decodedToken?.payload?.exp) {
      return true;
    }
    const expirationTime = decodedToken.payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime > expirationTime;
  }
}

export { JsonWebToken };
