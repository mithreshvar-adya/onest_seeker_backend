import express from 'express';
import { OndcOnestVersionHandlerMiddleware, OndcOnestVersionPayoloadValidatorMiddleware, validateSearchRequest } from '@adya/shared';
import V1SearchHandler from './version1.1/search/handler';
import V1SelectHandler from './version1.1/select/handler';
import V1InitHandler from './version1.1/init/handler';
import V1ConfirmHandler from './version1.1/confirm/handler';
import V1StatusHandler from './version1.1/status/handler';
import V1UpdateHandler from './version1.1/update/handler';
import V1SupportHandler from './version1.1/support/handler';
import V1TrackHandler from './version1.1/track/handler';
import BPPValidator from './version1.1/payload_validation/validation'
import { signatureVerification } from '@adya/shared';
import { BAP_KEYS } from "@adya/shared";
import * as crypto from 'crypto';


const v1_search_handler = V1SearchHandler.getInstance()
const v1_select_handler = V1SelectHandler.getInstance()
const v1_init_handler = V1InitHandler.getInstance()
const v1_confirm_handler = V1ConfirmHandler.getInstance()
const v1_status_handler = V1StatusHandler.getInstance()
const v1_update_handler = V1UpdateHandler.getInstance()
const v1_support_handler = V1SupportHandler.getInstance()
const v1_track_handler = V1TrackHandler.getInstance()
const v1_payload_validation = BPPValidator.getInstance()


const router = express.Router();

router.post("/clientapi/search", OndcOnestVersionHandlerMiddleware(v1_search_handler.search))
router.post("/clientapi/select", OndcOnestVersionHandlerMiddleware(v1_select_handler.select))
router.post("/clientapi/init", OndcOnestVersionHandlerMiddleware(v1_init_handler.init))
router.post("/clientapi/confirm", OndcOnestVersionHandlerMiddleware(v1_confirm_handler.confirm))
router.post("/clientapi/status", OndcOnestVersionHandlerMiddleware(v1_status_handler.status))
router.post("/clientapi/update", OndcOnestVersionHandlerMiddleware(v1_update_handler.update))
router.post("/clientapi/support", OndcOnestVersionHandlerMiddleware(v1_support_handler.support))
router.post("/clientapi/track", OndcOnestVersionHandlerMiddleware(v1_track_handler.track))



// router.post("/on_search", signatureVerification, OndcOnestVersionPayoloadValidatorMiddleware(v1_payload_validation.validateSearch), OndcOnestVersionHandlerMiddleware(v1_search_handler.search))
router.post("/on_search", validateSearchRequest, OndcOnestVersionHandlerMiddleware(v1_search_handler.on_search))
router.post("/on_select", validateSearchRequest, OndcOnestVersionHandlerMiddleware(v1_select_handler.on_select))
router.post("/on_init", signatureVerification, OndcOnestVersionPayoloadValidatorMiddleware(v1_payload_validation.validateInit), OndcOnestVersionHandlerMiddleware(v1_init_handler.on_init))
router.post("/on_confirm", signatureVerification, OndcOnestVersionPayoloadValidatorMiddleware(v1_payload_validation.validateConfirm), OndcOnestVersionHandlerMiddleware(v1_confirm_handler.on_confirm))
router.post("/on_status", signatureVerification, OndcOnestVersionPayoloadValidatorMiddleware(v1_payload_validation.validateStatus), OndcOnestVersionHandlerMiddleware(v1_status_handler.on_status))
router.post("/on_update", OndcOnestVersionHandlerMiddleware(v1_update_handler.update))
router.post("/on_support", OndcOnestVersionHandlerMiddleware(v1_support_handler.support))
router.post("/on_track", OndcOnestVersionHandlerMiddleware(v1_track_handler.track))

router.post('/on_subscribe', function (req, res) {
    try {
        const ondc_public_key = BAP_KEYS.ONDC_PUBLIC_KEY
        const protean_encryption_private_key = BAP_KEYS.ENCRYPTION_PRIVATE_KEY

        console.log("-------------1")
        const publicKey = crypto.createPublicKey({
            key: Buffer.from(ondc_public_key, "base64"), // Decode public key from base64
            format: "der", // Specify the key format as DER
            type: "spki", // Specify the key type as SubjectPublicKeyInfo (SPKI)
        });
        console.log("-------------2")
        const privateKey = crypto.createPrivateKey({
            key: Buffer.from(`${protean_encryption_private_key}`, "base64"), // Decode private key from base64
            format: "der", // Specify the key format as DER
            type: "pkcs8", // Specify the key type as PKCS#8
        });
        console.log("-------------3")
        // Calculate the shared secret key using Diffie-Hellman
        const sharedKey = crypto.diffieHellman({
            privateKey: privateKey,
            publicKey: publicKey,
        });
        console.log("-------------4")
        // Decrypt using AES-256-ECB
        const iv = Buffer.alloc(0); // ECB doesn't use IV
        const decipher = crypto.createDecipheriv("aes-256-ecb", sharedKey, iv);
        let decrypted = decipher.update(req.body?.challenge, "base64", "utf8");
        decrypted += decipher.final("utf8");
        console.log("-------------5")
        const onsubscribe_resp = {
            "answer": decrypted || ""
        }
        console.log("On Subscribe response======>>> ", onsubscribe_resp);
        res.json(onsubscribe_resp)
    }
    catch (err) {
        console.log("Error =======>>> ", err)
        throw err;
    }
});

export default router;