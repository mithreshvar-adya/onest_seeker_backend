import { ONDC_LAYER_BASE_URL, telemetry } from "@adya/shared";
import service from './service';
import { apiResponse } from "@adya/shared";
import { JsonWebToken } from "@adya/shared";
import { contextFactory } from "@adya/shared";
import { ENUM_ACTIONS } from "@adya/shared";
import { OnActions } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";
import axios from "axios";

const newService = service.getInstance();

const jsonWebToken = new JsonWebToken()
const on_action = new OnActions()

class Handler {

    private static instance: Handler | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Static method to get the singleton instance
    public static getInstance(): Handler {
        if (this.instance === null) {
        this.instance = new Handler();
        }
        return this.instance;
    }

    async status(req, res, next) {
        try {
            let { body } = req
            console.log("COURSE STATUS DATA==========>",JSON.stringify(body));
            let decoded = await jsonWebToken.verify((req.headers.authorization).split(" ")[1])
            if (!decoded) {
                res.json([{ "message": { "ack": { "status": "token expired" } } }]);
            }
            let { context, message } = body

            let new_context = {
                domain: context?.domain,
                transaction_id: context?.transaction_id,
                bpp_id: context?.bpp_id,
                bpp_uri: context?.bpp_uri,
                action: ENUM_ACTIONS.STATUS,
            }

            const protocolContext = await contextFactory.createBapContext(new_context)

            let statusOrderResponse = await newService.status(protocolContext, message)
            return statusOrderResponse
            // return res.status(200).json(statusOrderResponse);
        } catch (err) {
            console.log("Handler Error for course status ===========>>>> ", err)
            let Errortype = "Internal Error"
            let Errorcode = "23001"
            let Errormessage = "Cannot process response due to internal error, please retry"
            // return res.status(502).json(apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode,err, Errormessage))
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }

    async on_status(req, res, next) {
        try {
            let { body } = req

            let telemetry_start_time=body?.telemetry_start_time
            delete body?.telemetry_start_time

            console.log("RECEIVED COURSE ON_STATUS ==========>>>>>>",JSON.stringify(body));
            let create_payload = {
                "transaction_id": body?.context?.transaction_id,
                "action": body?.context?.action,
                "message_id": body?.context?.message_id,
                "response": body
            }
            await on_action.createOnAction(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, create_payload)
        try{
            const telemetry_end_time = process.hrtime.bigint();
            let telemetry_context=body?.context
            let telemetry_data={
                start_time:telemetry_start_time,
                end_time:telemetry_end_time.toString(),
                context:telemetry_context
            }
            // await telemetry(telemetry_data)
            const  headers= {
                'Content-Type': 'application/json'
            };
             let base_url = ONDC_LAYER_BASE_URL.base_url+"/telemetry"
             await axios.post(base_url, telemetry_data, { headers })
        }catch (err) {
            console.log("Error in telemetry===>>>")           
        }

            if(!(body?.error && body?.error?.code)){
                newService.on_status(body?.context, body?.message)
            }
            return apiResponse.ONEST_ONDC_SUCCESS_RESP()
            // res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
            // return res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
        } catch (err) {
            console.log("Handler Error for course on_status ===========>>>> ", err)
            let Errortype = "Internal Error"
            let Errorcode = "23001"
            let Errormessage = "Cannot process response due to internal error, please retry"
            // return res.status(502).json(apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode,err, Errormessage))
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }
}

export default Handler