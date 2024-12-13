import { commonProtocolAPI, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { ENUM_ACTIONS, BAP_KEYS, apiResponse } from "@adya/shared";
import { JobCache, Jobs } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";
import axios from "axios";

const job_Cache_module = new JobCache()
const job_module = new Jobs()


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

    async select(protocol_context, message, user_id) {
        try {


            const request_payload = {
                context: protocol_context,
                message: message,
            };

            const cacheData = await job_Cache_module.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { job_id: message?.order?.items?.[0]?.id })
            const orderData = {
                transaction_id: protocol_context?.transaction_id,
                message_id: protocol_context?.message_id,
                context: protocol_context,
                provider_id: cacheData?.provider_id,
                provider_descriptor: cacheData?.provider_descriptor,
                select_req: request_payload,
                user_id: user_id,
                job_id: cacheData?.job_id,
                job_descriptor: cacheData?.job_descriptor,
                content_metadata: cacheData?.content_metadata,
                quantity: cacheData?.quantity,
                fulfillments: cacheData?.fulfillments,
            };

            await job_module.createJobRecord(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, orderData);

            // let resp = await commonProtocolAPI(
            //     protocol_context.bpp_uri,
            //     ENUM_ACTIONS.SELECT,
            //     request_payload,
            //     protocol_context.bap_id,
            //     BAP_KEYS.UNIQUE_KEY_ID,
            //     BAP_KEYS.PRIVATE_KEY
            // )

            try {
                const headers = {
                    'Content-Type': 'application/json'
                };

                // const payload = {
                //     base_url: protocol_context.bpp_uri,
                //     action: ENUM_ACTIONS.SELECT,
                //     data: request_payload,
                //     subscriber_id: protocol_context.bap_id,
                //     subscriber_ukid: BAP_KEYS.JOB_UNIQUE_KEY_ID,
                //     subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                // }
                let payload = {
                    data:request_payload               
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/job/select"
                console.log("base_url", base_url);

                const resp = await axios.post(base_url, payload, { headers })
                console.log("resp", resp?.data)
                return resp?.data
            } catch (err) {
                console.log("Error ===>>>", err);
            }
        }
        catch (err) {
            console.log("Service Error in job select=====", err)
        }

    }

    async on_select(context, message) {
        try {
            const upsert_payload = {
                "transaction_id": context?.transaction_id,
                "onselect_resp": {
                    "context": context,
                    "message": message
                },
                time: message?.order?.items?.[0]?.time,
                locations: message?.order?.provider?.locations
            }
            const filterQuery = {
                $or: [
                    { "transaction_id": context?.transaction_id },
                    { "message_id": context?.message_id }
                ]
            }
            await job_module.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, upsert_payload)
        }
        catch (err) {
            console.log("Service Error job on_select=====", err)
        }

    }

}

export default Service