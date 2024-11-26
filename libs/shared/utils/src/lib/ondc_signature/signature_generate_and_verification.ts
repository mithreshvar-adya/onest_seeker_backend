// import _sodium from 'libsodium-wrappers';
// import _ from 'lodash'

import * as _sodium from 'libsodium-wrappers';
import {
  crypto_generichash,
  crypto_sign_detached,
  crypto_sign_verify_detached,
  from_base64
} from 'libsodium-wrappers';

import { REGISTRY_BASE_URL } from './constant';
import axios from 'axios';
import { createAuthorizationHeader as createAuthHeader,isHeaderValid  } from "ondc-crypto-sdk-nodejs";
import { env } from 'process';


//create authorization header
export const createAuthorizationHeader = async (message:any, subscriber_id:any, unique_key_id:any, signing_private_key:any) => {
    // const { signing_string,expires,created } = await createSigningString(JSON.stringify(message));
    // const signature = await signMessage(signing_string, signing_private_key || "");

    // const header = `Signature keyId="${subscriber_id}|${unique_key_id}|ed25519",algorithm="ed25519", created="${created}", expires="${expires}", headers="(created) (expires) digest", signature="${signature}"`

    // // console.log("Header ------->>>>", header)
    // return header;
    console.log("code updated ------------------------------------");
    
    console.log("------message-------",JSON.stringify(message),subscriber_id,unique_key_id,signing_private_key)
    const header = await createAuthHeader({
        body: JSON.stringify(message),
        privateKey: signing_private_key,
        subscriberId: subscriber_id, // Subscriber ID that you get after registering to ONDC Network
        subscriberUniqueKeyId: unique_key_id, // Unique Key Id or uKid that you get after registering to ONDC Network
      });

      let t=await isSignatureValid(header,message,"BAP","production")

      console.log("-----------header----------",header,t)
      return header
}
export const createSigningString = async (message:any, created:any=null, expires:any=null) => {
    if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
    if (!expires) expires = (parseInt(created) + (1 * 60 * 60)).toString();
    await _sodium.ready;
    const sodium = _sodium;
    const digest = crypto_generichash(64, sodium.from_string(message));
    const digest_base64 = sodium.to_base64(digest, _sodium.base64_variants.ORIGINAL);
    const signing_string = 
    `(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest_base64}`
    // const signing_string =`(created):${created}(expires):${expires}digest:BLAKE-512=${digest_base64}`
    return { signing_string, created, expires };
}
export const signMessage = async (signing_string:any, signing_private_key:any) => {
    await _sodium.ready;
    const sodium = _sodium;

    const signedMessage = crypto_sign_detached(signing_string,from_base64(signing_private_key, _sodium.base64_variants.ORIGINAL));
    return sodium.to_base64(signedMessage, _sodium.base64_variants.ORIGINAL);
}


//verify authorization header
const lookupRegistry = async (subscriber_id:any, subscribe_type:any, domain:any, ondc_env:any="production") => {
    console.log(subscriber_id, subscribe_type, domain)

    let api_request = {
        baseURL: ondc_env=="develop" ? REGISTRY_BASE_URL.staging 
        : ondc_env=="staging" ? REGISTRY_BASE_URL.staging
        : ondc_env=="preprod" ? REGISTRY_BASE_URL.preprod
        : ondc_env=="production" ? REGISTRY_BASE_URL.production : "",
        url: "lookup",
        method: "POST",
        data: {
            subscriber_id: subscriber_id,
            type: subscribe_type,
            country: 'IND',
            // domain: process.env.DOMAIN,
        }
    };
    console.log("lookup registry payload",api_request);

    try{
        let api_response = await axios(api_request);
        console.log("lookupRegistry api_response",api_response?.data)
        return api_response?.data
    }
    catch(err){
        console.log("Error ----->>>>", err)
        return []
    }
};
export const isSignatureValid = async (header:any, body:any, subscriber_type:any, env_type:any) => {
    try {
        console.log("signature verification", env_type);
        
        const headerParts:any = split_auth_header(header);
        console.log("header of lookup------------", header);
        console.log("headerParts -------------", headerParts, subscriber_type);


        const keyIdSplit = headerParts['keyId'].split('|')
        const subscriber_id = keyIdSplit[0]
        const keyId = keyIdSplit[1]
        
        let public_key=""
        let domain =body?.context?.domain 
        let registry_resp_arr = await lookupRegistry(subscriber_id, subscriber_type, domain, env_type)
        console.log("look up data",registry_resp_arr);
        
        if (registry_resp_arr.length > 0) {
            public_key = registry_resp_arr?.[0]?.signing_public_key || ""
        }
        console.log("public key",public_key)

        delete body?.telemetry_start_time 
        const isValid = await isHeaderValid({
            header: header, // The Authorisation header sent by other network participants
            body: JSON.stringify(body),
            publicKey: public_key,
      });
      console.log("-----isValid------",isValid)
        // const isValid = await verifyHeader(headerParts, body, String(public_key))
        // console.log("isSignatureValid------------------------->",isValid);
        return isValid
    } catch (err) {
        console.log("err ====>>", err)
        return false
    }
}
const remove_quotes = (a:any) => {
    return a.replace(/^["'](.+(?=["']$))["']$/, '$1');
}
const split_auth_header = (auth_header:any) => {
    const header = auth_header.replace('Signature ', '');
    let re = /\s*([^=]+)=([^,]+)[,]?/g;
    let m;
    let parts:any = {}
    while ((m = re.exec(header)) !== null) {
        if (m) {
            parts[m[1]] = remove_quotes(m[2]);
        }
    }
    return parts;
}
const verifyHeader = async (headerParts:any, body:any, public_key:any) => {
    console.log(public_key)
    const { signing_string } = await createSigningString(JSON.stringify(body), headerParts['created'], headerParts['expires']);
    const verified = await verifyMessage(headerParts['signature'], signing_string, public_key);
    console.log("verified-------------------",verified);
    return verified;
}
const verifyMessage = async (signedString:any, signingString:any, publicKey:any) => {
    try {
        await _sodium.ready;
        const sodium = _sodium;
        return crypto_sign_verify_detached(from_base64(signedString, _sodium.base64_variants.ORIGINAL), signingString, from_base64(publicKey, _sodium.base64_variants.ORIGINAL));
    } catch (error) {
        return false
    }
}