import { ENUM_ACTIONS, BAP_KEYS, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { Jobs } from "@adya/shared";
import { commonProtocolAPI } from "@adya/shared";
import { apiResponse } from "@adya/shared";
import axios from "axios";
import { GlobalEnv } from "../../../config/env";
const job_order = Jobs.getInstance()

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

    async status(protocol_context, message) {
        try {
            const request_payload = {
                context: protocol_context,
                message: message,
            };

            const reqBody = {
                bpp_uri: protocol_context.bpp_uri,
                action: ENUM_ACTIONS.STATUS,
                request_payload: request_payload,
                bap_id: protocol_context.bap_id
            }

            // const resp = await commonProtocolAPI(
            //     protocol_context.bpp_uri,
            //     ENUM_ACTIONS.STATUS,
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
              
                // const payload = {
                //     base_url: protocol_context.bpp_uri,
                //     action: ENUM_ACTIONS.STATUS,
                //     data: request_payload,
                //     subscriber_id: protocol_context.bap_id,
                //     subscriber_ukid: BAP_KEYS.JOB_UNIQUE_KEY_ID,
                //     subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                // }
                let payload = {
                    data:request_payload               
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/job/status"
                console.log("base_url", base_url);
              
                const resp = await axios.post(base_url, payload, { headers })
                console.log("ondc layer resp", resp?.data)
                return resp?.data
              } catch (err) {
                  console.log("Error ===>>>", err);
              }

        }
        catch (err) {
            console.log("Service Error in job status =====", err)
        }

    }

    async on_status(context, message) {
        try {

            const upsert_payload = {
                "updatedAt": message?.order?.fulfillments[0]?.state?.updated_at,
                "fulfillment_status": message?.order?.fulfillments[0]?.state?.descriptor,
                "onstatus_resp": {
                    "context": context,
                    "message": message
                },
                "fulfillments": message?.order?.fulfillments
            }


            const filterQuery = {
                "transaction_id": context?.transaction_id,
                "order_id": message?.order?.id
            }
            await job_order.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, upsert_payload)
        }
        catch (err) {
            console.log("Service Error job on_status=====", err)
        }

    }
}

export default Service