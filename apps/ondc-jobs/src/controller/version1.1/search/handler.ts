
import { ONDC_LAYER_BASE_URL, telemetry } from "@adya/shared";
import service from './service';
import { apiResponse } from "@adya/shared";
import { contextFactory } from "@adya/shared";
import { ENUM_ACTIONS } from "@adya/shared";
import { GlobalEnv } from '../../../config/env';
import axios from "axios";
const newService = service.getInstance();

class Handler {

    private static instance: Handler | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Static method to get the singleton instance
    public static getInstance(): Handler {
        if (this.instance === null) {
            this.instance = new Handler();
        }
        return this.instance;
    }

    async search(req, res, next) {
        try {
            const { body } = req
            console.log("JOB SEARCH DATA==========>", body);
            // let request_context = body?.context || {}
            // request_context.bpp_id = ""
            // request_context.bpp_uri = ""

            const new_context = {
                domain: GlobalEnv.DOMAIN,
                bap_id: GlobalEnv.ONDC_DETAILS.BAP_ID,
                bap_uri: GlobalEnv.ONDC_DETAILS.BAP_URL,
                action: ENUM_ACTIONS.SEARCH,
                // bpp_id: request_context?.bpp_id,
                // bpp_uri: request_context?.bpp_uri,
                // area_code : request_context?.area_code || "",
                // city: request_context?.city || ""
            }
            const protocolContext = await contextFactory.createBapContext(new_context)

            const resp = await newService.search(protocolContext, body?.message)
            return resp
            // return res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
        } catch (err) {
            console.log("Handler Error for job search===========>>>> ", err)
            const Errortype = "Internal Error"
            const Errorcode = "23001"
            const Errormessage = "Cannot process response due to internal error, please retry"
            // return res.status(502).json(apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode,err, Errormessage))
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }

    async on_search(req, res, next) {
        try {
            const { body } = req
            
            const telemetry_start_time = body?.telemetry_start_time
            delete body?.telemetry_start_time

            console.log("RECEIVED JOB ON_SEARCH ==========>>>>>>", body);

            try {

                const telemetry_end_time = process.hrtime.bigint();
                const telemetry_context = body?.context
                const telemetry_data = {
                    start_time: telemetry_start_time,
                    end_time: telemetry_end_time.toString(),
                    context: telemetry_context
                }
                // await telemetry(telemetry_data)
                const  headers= {
                    'Content-Type': 'application/json'
                };
                 let base_url = ONDC_LAYER_BASE_URL.base_url+"/telemetry"
                 await axios.post(base_url, telemetry_data, { headers })
            } catch (err) {
                console.log("Error in telemetry===>>>")
            }

            newService.on_search(body)
            // return res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
            return apiResponse.ONEST_ONDC_SUCCESS_RESP()
        } catch (err) {
            console.log("Handler Error for job on_search ===========>>>> ", err)
            const Errortype = "Internal Error"
            const Errorcode = "23001"
            const Errormessage = "Cannot process response due to internal error, please retry"
            // return res.status(502).json(apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode,err, Errormessage))
            // return apiResponse.ONEST_ONDC_FAILURE_RESP("error_type", "error_code",err, "error_message")
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }

}

export default Handler