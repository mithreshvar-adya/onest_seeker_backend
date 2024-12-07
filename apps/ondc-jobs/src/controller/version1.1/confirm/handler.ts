
import { telemetry } from "@adya/shared";
import service from './service';
import { v4 as uuidv4 } from 'uuid';
import { apiResponse } from "@adya/shared";
import { JsonWebToken } from "@adya/shared";
import { contextFactory } from "@adya/shared";
import { ENUM_ACTIONS } from "@adya/shared";
import { OnActions,Jobs } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";

const newService = service.getInstance();

const jsonWebToken = new JsonWebToken()
const on_action = new OnActions()
const job_module = new Jobs()

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

    async confirm(req, res, next) {
        try {
            let { body } = req
            console.log("JOB CONFIRM DATA==========>",body);
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
                action: ENUM_ACTIONS.CONFIRM,
            }

            const protocolContext = await contextFactory.createBapContext(new_context)

            let confirmOrderResponse = await newService.confirm(protocolContext, message, decoded?.id)
            return confirmOrderResponse
            // return res.status(200).json(confirmOrderResponse);
        } catch (err) {
            console.log("Handler Error for job confirm ===========>>>> ", err)
            let Errortype = "Internal Error"
            let Errorcode = "23001"
            let Errormessage = "Cannot process response due to internal error, please retry"
            // return res.status(502).json(apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode,err, Errormessage))
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }

    async on_confirm(req, res, next) {
        try {
            let { body } = req

            let telemetry_start_time=body?.telemetry_start_time
            delete body?.telemetry_start_time

            console.log("RECEIVED JOB ON_CONFIRM ==========>>>>>>",body);

            let job_query = {
                transaction_id: body?.context?.transaction_id,
            };
            let jobOrder = await job_module.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,job_query)

            let onInitProvider = jobOrder?.oninit_resp?.message?.order?.provider
            let onInitItems = jobOrder?.oninit_resp?.message?.order?.items
            let onInitFulfillments = jobOrder?.oninit_resp?.message?.order?.fulfillments

            let provider=body?.message?.order?.provider
            let items=body?.message?.order?.items
            let fulfillments=body?.message?.order?.fulfillments[0]

            if(onInitProvider?.id!=provider?.id || onInitProvider?.descriptor?.name != provider?.descriptor?.name){
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
                        context:telemetry_context,
                        error: {
                            type: 'Provider details mismatch',
                            code: '30016',
                            message: 'Provider details mismatch',
                        },
                    }
                    await telemetry(telemetry_data)
                }catch (err) {
                    console.log("Error in on_action failure telemetry===>>>")           
                }


                return apiResponse.ONEST_ONDC_FAILURE_RESP("Provider details mismatch", "30016", "Provider details mismatch", "")
            }

            if(onInitItems[0]?.id!=items[0]?.id || onInitItems[0]?.descriptor?.name != items[0]?.descriptor?.name){
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
                        context:telemetry_context,
                        error: {
                            type: 'Item details mismatch',
                            code: '30017',
                            message: 'Item details mismatch',
                        },
                    }
                    await telemetry(telemetry_data)
                }catch (err) {
                    console.log("Error in on_action failure telemetry===>>>")           
                }

                return apiResponse.ONEST_ONDC_FAILURE_RESP("Item details mismatch", "30017", "Item details mismatch", "")
            }

            const isIdPresent = onInitFulfillments.some(fulfillment => fulfillment.id === fulfillments?.id);

            if (!isIdPresent) {
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
                        context:telemetry_context,
                        error: {
                            type: 'Fulfillment details mismatch',
                            code: '30018',
                            message: 'Fulfillment details mismatch',
                        },
                    }
                    await telemetry(telemetry_data)
                }catch (err) {
                    console.log("Error in on_action failure telemetry===>>>")           
                }

                return apiResponse.ONEST_ONDC_FAILURE_RESP("Fulfillment details mismatch", "30018", "Fulfillment details mismatch", "")
            } 

            


            let create_payload = {
                "transaction_id": body?.context?.transaction_id,
                "action": body?.context?.action,
                "message_id": body?.context?.message_id,
                "response": body
            }
            await on_action.createOnAction(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,create_payload)
            
            try{
            const telemetry_end_time = process.hrtime.bigint();
            let telemetry_context=body?.context
            let telemetry_data={
                start_time:telemetry_start_time,
                end_time:telemetry_end_time.toString(),
                context:telemetry_context
            }
            await telemetry(telemetry_data)
        }catch (err) {
            console.log("Error in telemetry===>>>")           
        }

            if(!(body?.error && body?.error?.code)){
                newService.on_confirm(body?.context, body?.message)
            }
            return apiResponse.ONEST_ONDC_SUCCESS_RESP()
            // res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
            // return res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
        } catch (err) {
            console.log("Handler Error for job on_confirm ===========>>>> ", err)
            let Errortype = "Internal Error"
            let Errorcode = "23001"
            let Errormessage = "Cannot process response due to internal error, please retry"
            // return res.status(502).json(apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode,err, Errormessage))
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }
}

export default Handler