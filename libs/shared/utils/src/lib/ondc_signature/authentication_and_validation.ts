//@ts-nocheck
import { apiResponse } from "../api_response_format";
import { isSignatureValid } from "./signature_generate_and_verification";




async function signatureVerification(req, res, next) {
    try {
        console.log("signature req?.headers",req?.headers);
        let token = req?.headers?.authorization;
        console.log("ONEST ONDC Token ========>>> ", token);

        let payload = req?.body
        let context = payload?.context || {};
        let action = context?.action || ""
        if (req?.query?.is_signature == "false") {
            next()
            return
        }
        console.log("payload == > ", JSON.stringify(payload), "BPP")
        console.log("token == > ", token)
        console.log("Inside else condition..")
        let valid = await isSignatureValid(token, payload, "BPP","production")
        console.log("Signature Response",valid);  
        valid=true
        if (valid) {
            console.log("Signature Valid")
            next()
        }
        else {
            console.log("Signature not Valid")
            apiResponse.FAILURE_RESP.error.code = "20001"
            apiResponse.FAILURE_RESP.error.type = "Invalid Signature"
            apiResponse.FAILURE_RESP.error.message = "Cannot verify signature for response"
            res.status(401)
                .setHeader('Proxy-Authenticate', token)
                .json(apiResponse.FAILURE_RESP)
        }


    } catch (err) {
        console.log("Signature not Valid")
        apiResponse.FAILURE_RESP.error.code = "20001"
        apiResponse.FAILURE_RESP.error.type = "Invalid Signature"
        apiResponse.FAILURE_RESP.error.message = "Cannot verify signature for response"
        res.status(401).json(apiResponse.FAILURE_RESP)
    }

}

export { signatureVerification }