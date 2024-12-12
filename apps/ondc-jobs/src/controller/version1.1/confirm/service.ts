import { ENUM_ACTIONS, BAP_KEYS, JobCache, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { Jobs } from "@adya/shared";
import { apiResponse } from '@adya/shared'
import axios from "axios";
import { commonProtocolAPI } from "@adya/shared";
import { SendEmailOrSMS } from "../../../shared/utils/helpers/email_or_sms";
import { GlobalEnv } from "../../../config/env";
const job_module = new Jobs()
const job_cache = JobCache.getInstance()


class Service {
    private static instance: Service | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Static method to get the singleton instance
    public static getInstance(): Service {
        if (this.instance === null) {
            this.instance = new Service();
        }
        return this.instance;
    }

    async confirm(protocol_context, message, user_id) {
        try {

            let query = {
                transaction_id: protocol_context?.transaction_id,
            };
            let jobOrder = await job_module.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,query)

            console.log("job order---------", JSON.stringify(jobOrder));
            

            let confirm_fulfillments=jobOrder?.oninit_resp?.message?.order?.fulfillments
            if(confirm_fulfillments.length>0){
                confirm_fulfillments.forEach(fulfillment => {
                    if(fulfillment?.type){
                        delete fulfillment?.type;
                    }
                    if(fulfillment?.state){
                        delete fulfillment?.state;
                    }
                });

                confirm_fulfillments[0]?.customer?.person?.tags.forEach(tag => {
                    if (tag.descriptor.code === "emp-details") {
                      tag.list.forEach(item => {
                        if (item.descriptor.code === "expected-salary") {
                          item.descriptor.name = "Expected Salary";
                        }
                        if (item.descriptor.code === "total-experience") {
                          item.descriptor.name = "Total Experience";
                        }
                      });
                    }
                  });

                  message.order.fulfillments = confirm_fulfillments
            }
            // message.order.fulfillments = jobOrder?.oninit_resp?.message?.order?.fulfillments

            let request_payload = {
                context: protocol_context,
                message: message,
            };

            let orderData = {
                confirm_req: request_payload
            };

            await job_module.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, orderData);

            // let resp = await commonProtocolAPI(
            //     protocol_context.bpp_uri,
            //     ENUM_ACTIONS.CONFIRM,
            //     request_payload,
            //     protocol_context.bap_id,
            //     BAP_KEYS.JOB_UNIQUE_KEY_ID,
            //     BAP_KEYS.PRIVATE_KEY
            // )
            // return resp

            try {
                const headers = {
                    'Content-Type': 'application/json'
                };
              
                const payload = {
                    base_url: protocol_context.bpp_uri,
                    action: ENUM_ACTIONS.CONFIRM,
                    data: request_payload,
                    subscriber_id: protocol_context.bap_id,
                    subscriber_ukid: BAP_KEYS.JOB_UNIQUE_KEY_ID,
                    subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/job/confirm"
                console.log("base_url", base_url);
              
                const resp = await axios.post(base_url, payload, { headers })
                console.log("ondc layer resp", resp?.data)
                return resp?.data
              } catch (err) {
                  console.log("Error ===>>>", err);
              }

            // let reqBody = {
            //     bpp_uri: protocol_context.bpp_uri,
            //     action: ENUM_ACTIONS.CONFIRM,
            //     request_payload: request_payload,
            //     bap_id: protocol_context.bap_id
            // }

            // let commonProcotolUrl = ""
            // try {
            //     let api_response = await axios.post(commonProcotolUrl, reqBody);
            //     return api_response?.data
            // }
            // catch (err) {
            //     console.log("Error in job confirm ===>>>", err)
            //     let err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
            //     return (err_resp);
            // }

            // let reqBody = {
            //     bpp_uri: protocol_context.bpp_uri,
            //     action: ENUM_ACTIONS.CONFIRM,
            //     request_payload: request_payload,
            //     bap_id: protocol_context.bap_id
            // }

            // let commonProcotolUrl = GlobalEnv?.COMMON_PROTOCOL_URL
            // try {
            //     let api_response = await axios.post(commonProcotolUrl, reqBody);
            //     return api_response?.data
            // }
            // catch (err) {
            //     console.log("Error in course confirm ===>>>", err)
            //     let err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
            //     return (err_resp);
            // }

        }
        catch (err) {
            console.log("Service Error in job confirm=====", err)
        }

    }

    async on_confirm(context, message) {
        try {
            let fulfillments = message?.order?.fulfillments
            let upsert_payload = {
                "order_id": message?.order?.id,
                "state": "Created",
                "createdAt": new Date(),
                "onconfirm_resp": {
                    "context": context,
                    "message": message
                },
                fulfillments: fulfillments,
                fulfillment_status: fulfillments?.[0]?.state?.descriptor
            }

            let filterQuery = {
                "transaction_id": context?.transaction_id,
            }
            await job_module.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, upsert_payload)

            let resp:any = await job_module.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, {"transaction_id": context?.transaction_id})
            SendEmailOrSMS("JOB_CONFIRMATION",resp?.user_id, 0 , message?.order?.id)

            let Job_Cache_payload = {
                $addToSet: { applied_userIds: resp?.user_id}
            }
            let Job_Cache_query = {
                "job_id": resp?.job_id
            }

            await job_cache.updateJob_Cache(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, Job_Cache_query, Job_Cache_payload)
            
        }
        catch (err) {
            console.log("Service Error for job on_confirm=====", err)
        }

    }

}

export default Service