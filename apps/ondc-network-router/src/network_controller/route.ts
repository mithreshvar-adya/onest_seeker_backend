import express from 'express';
import axios from "axios";
import { OnestNetworkRouterConfig, apiResponse } from '@adya/shared'
import { ONEST_DOMAINS } from '@adya/enums'
import { signatureVerification } from '@adya/shared';
import { commonProtocolAPI } from "@adya/shared";
import { BAP_KEYS } from "@adya/shared";

const router = express.Router();

import { GlobalEnv } from '../Config/env';

async function onest_domain_redirection(req, res, next) {
    try {
        const telemetry_start_time = process.hrtime.bigint();
        console.log("==========INSIDE ONEST-NETWORK ADAPTOR==========", JSON.stringify(req?.body));

        const incoming_domain = req?.body?.context?.domain || ""
        let rediriction_link = ""
        if (incoming_domain == ONEST_DOMAINS.COURSE) {
            rediriction_link = GlobalEnv.COURSE_REDIRECTION_URL
        }
        else if (incoming_domain == ONEST_DOMAINS.JOB) {
            rediriction_link = GlobalEnv.JOB_REDIRECTION_URL
        }
        else if (incoming_domain == ONEST_DOMAINS.SCHOLARSHIP) {
            rediriction_link = GlobalEnv.SCHOLARSHIP_REDIRECTION_URL
        }
        else {
            return res.status(404).json(apiResponse.ONEST_ONDC_FAILURE_RESP("Invalid API", "", "Invalid Route", "Upsupported Domain Request"));
        }

        req.body.telemetry_start_time = telemetry_start_time.toString();

        const api_request = {
            url: rediriction_link + "/" + req?.body?.context?.action,
            // baseUrl: "",
            method: "POST",
            data: req?.body,
            headers: req?.headers
        };
        const config = {
            // headers: {
            //   'Accept': '*/*',
            //   'Content-Type': 'application/json'
            // }
            headers: {
                Authorization: req?.headers?.authorization,
                "Accept": "application/json"
            },
        };

        try {
            console.log(JSON.stringify(api_request.url))
            // let api_response = await axios(api_request);
            const api_response = await axios.post(api_request.url, api_request.data, config);
            return res.status(200).json(api_response?.data)
        }
        catch (err) {
            console.log("Error ===>>>", err)
            const err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
            return res.status(err?.response?.status || 200).send(err_resp);
        }
    }
    catch (err) {
        console.log("Error ===>>>", err)
        next()
    }
}

router.post("/bap/on_search", onest_domain_redirection)
router.post("/bap/on_select", onest_domain_redirection)
router.post("/bap/on_init", onest_domain_redirection)
router.post("/bap/on_confirm", onest_domain_redirection)
router.post("/bap/on_update", onest_domain_redirection)
router.post("/bap/on_status", onest_domain_redirection)
router.post("/bap/on_track", onest_domain_redirection)
router.post("/bap/on_support", onest_domain_redirection)
router.post("/bap/on_track", onest_domain_redirection)
router.post("/subscription", async function (req, res) {
    const rediriction_link = GlobalEnv.SUBSCRIPTION_REDIRECTION_URL
    const api_request = {
        baseURL: rediriction_link + "/" + req?.body?.context?.action,
        url: "",
        method: "POST",
        data: req?.body,
        headers: req?.headers
    };
    try {
        console.log(JSON.stringify(api_request))
        const api_response = await axios(api_request);
        return res.status(200).json(api_response?.data)
    }
    catch (err) {
        console.log("Error ===>>>", err)
        const err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
        return res.status(err?.response?.status || 200).send(err_resp);
    }
})


router.post("/common_protocal_api", async function (req, res) {
    try {

        const { body } = req
        console.log("\n entered" + body.action + "common_protocal");
        let uk_id = ""
        if (body.bap_id == "onest-bap.skillsetu.co") {
            uk_id = BAP_KEYS.LEARNING_UNIQUE_KEY_ID
        } else if (body.bap_id == "onest-jobs-bap.skillsetu.co") {
            uk_id = BAP_KEYS.JOB_UNIQUE_KEY_ID
        }
        const resp = await commonProtocolAPI(
            body.bpp_uri,
            body.action,
            body.request_payload,
            body.bap_id,
            uk_id,
            BAP_KEYS.PRIVATE_KEY
        )
        return res.status(200).json(resp)
    } catch (err) {
        console.log("Error in common_protocal_api---->", err);
        const err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
        return res.status(err?.response?.status || 200).send(err_resp);
    }
})

export default router;