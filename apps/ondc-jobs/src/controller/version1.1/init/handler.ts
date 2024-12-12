import service from './service';
import { v4 as uuidv4 } from 'uuid';
import { apiResponse, ONDC_LAYER_BASE_URL, telemetry } from "@adya/shared";
import { JsonWebToken } from "@adya/shared";
import { contextFactory } from "@adya/shared";
import { ENUM_ACTIONS } from "@adya/shared";
import { OnActions,Jobs } from "@adya/shared";
import { GlobalEnv } from '../../../config/env';
import axios from 'axios';

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

    async init(req, res, next) {
        try {
            let { body } = req
            console.log("JOB INIT DATA==========>",body);
            let decoded = await jsonWebToken.verify((req.headers.authorization).split(" ")[1])
            if (!decoded) {
                res.json([{ "message": { "ack": { "status": "token expired" } } }]);
            }
            let { context, message, application_details } = body

            let new_context = {
                domain: context?.domain,
                transaction_id: context?.transaction_id,
                bpp_id: context?.bpp_id,
                bpp_uri: context?.bpp_uri,
                action: ENUM_ACTIONS.INIT,
            }

            const protocolContext = await contextFactory.createBapContext(new_context)

            let initOrderResponse = await newService.init(protocolContext, message, decoded?.id, application_details)
            // return res.status(200).json(initOrderResponse);
            // return apiResponse.ONEST_ONDC_SUCCESS_RESP()
            return initOrderResponse
        } catch (err) {
            console.log("Handler Error for job init ===========>>>> ", err)
            let Errortype = "Internal Error"
            let Errorcode = "23001"
            let Errormessage = "Cannot process response due to internal error, please retry"
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }

    async on_init(req, res, next) {
        try {
            let { body } = req

            let telemetry_start_time=body?.telemetry_start_time
            delete body?.telemetry_start_time
            
            console.log("RECEIVED JOB ON_INIT ==========>>>>>>",body);

            let job_query = {
                transaction_id: body?.context?.transaction_id,
            };
            let jobOrder = await job_module.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,job_query)

            let onSelectProvider = jobOrder?.onselect_resp?.message?.order?.provider
            let onSelectItems = jobOrder?.onselect_resp?.message?.order?.items
            let onSelectFulfillments = jobOrder?.onselect_resp?.message?.order?.fulfillments

            let provider=body?.message?.order?.provider
            let items=body?.message?.order?.items
            let fulfillments=body?.message?.order?.fulfillments[0]

            if(onSelectProvider?.id!=provider?.id || onSelectProvider?.descriptor?.name != provider?.descriptor?.name){
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
                    // await telemetry(telemetry_data)
                    const  headers= {
                        'Content-Type': 'application/json'
                    };
                     let base_url = ONDC_LAYER_BASE_URL.base_url+"/telemetry"
                     await axios.post(base_url, telemetry_data, { headers })
                }catch (err) {
                    console.log("Error in on_action failure telemetry===>>>")           
                }


                return apiResponse.ONEST_ONDC_FAILURE_RESP("Provider details mismatch", "30016", "Provider details mismatch", "")
            }

            if(onSelectItems[0]?.id!=items[0]?.id || onSelectItems[0]?.descriptor?.name != items[0]?.descriptor?.name){
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
                    // await telemetry(telemetry_data)
                    const  headers= {
                        'Content-Type': 'application/json'
                    };
                     let base_url = ONDC_LAYER_BASE_URL.base_url+"/telemetry"
                     await axios.post(base_url, telemetry_data, { headers })
                }catch (err) {
                    console.log("Error in on_action failure telemetry===>>>")           
                }

                return apiResponse.ONEST_ONDC_FAILURE_RESP("Item details mismatch", "30017", "Item details mismatch", "")
            }


            // res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
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
            console.log("body?.error",JSON.stringify(body));

            if(!(body?.error && body?.error?.code)){
                console.log("no errors ");
                
                newService.on_init(body?.context, body?.message)
            }
            return apiResponse.ONEST_ONDC_SUCCESS_RESP()
            // return res.status(200).json(apiResponse.ONEST_ONDC_SUCCESS_RESP())
        } catch (err) {
            console.log("Handler Error for job on_init ===========>>>> ", err)
            let Errortype = "Internal Error"
            let Errorcode = "23001"
            let Errormessage = "Cannot process response due to internal error, please retry"
            return apiResponse.ONEST_ONDC_FAILURE_RESP(Errortype, Errorcode, err, Errormessage)
        }
    }
}

export default Handler