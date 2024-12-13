import { commonProtocolAPI, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { ENUM_ACTIONS, BAP_KEYS } from "@adya/shared";
import { CourseOrder, CourseCache } from "@adya/shared";
import axios from "axios";
import { apiResponse } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";

const course_order = CourseOrder.getInstance()
const course_cache = CourseCache.getInstance()


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
            let itemData = {}
            let orderData = {}
            const cacheOrderData = await course_cache.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { course_id: message?.order?.items?.[0]?.id })

            itemData = {
                course_id: cacheOrderData?.course_id,
                course_descriptor: cacheOrderData?.course_descriptor,
                creator_descriptor: cacheOrderData?.creator_descriptor,
                content_metadata: cacheOrderData?.content_metadata,
                price: cacheOrderData?.price,
                quantity: cacheOrderData?.quantity,
                ratings: cacheOrderData?.ratings,
                rateable: cacheOrderData?.rateable,
                fulfillments: cacheOrderData?.fulfillments,
                category_ids: cacheOrderData?.category_ids
            }
            orderData = {
                transaction_id: protocol_context?.transaction_id,
                message_id: protocol_context?.message_id,
                context: protocol_context,
                provider_id: cacheOrderData?.provider_id,
                provider_descriptor: cacheOrderData?.provider_descriptor,
                select_req: request_payload,
                total_price: cacheOrderData?.total_price,
                items: itemData,
                user_id: user_id,
            };

            await course_order.createCourse(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, orderData);


            const reqBody = {
                bpp_uri: protocol_context.bpp_uri,
                action: ENUM_ACTIONS.SELECT,
                request_payload: request_payload,
                bap_id: protocol_context.bap_id
            }

            // let commonProcotolUrl = GlobalEnv?.COMMON_PROTOCOL_URL
            // try {
            //     console.log("commonProcotolUrl--------",commonProcotolUrl);
            //     console.log("reqBody--------",JSON.stringify(reqBody));

            //     let api_response = await axios.post(commonProcotolUrl, reqBody);
            //     console.log("api_response----------", JSON.stringify(api_response?.data));
            //     return api_response?.data
            // }
            // catch (err) {
            //     console.log("Error in course select ===>>>", err)
            //     let err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
            //     return (err_resp);
            // }

            try {
                const headers = {
                    'Content-Type': 'application/json'
                };

                // const payload = {
                //     base_url: protocol_context?.bpp_uri,
                //     action: ENUM_ACTIONS.SELECT,
                //     data: request_payload,
                //     subscriber_id: protocol_context?.bap_id,
                //     subscriber_ukid: BAP_KEYS.LEARNING_UNIQUE_KEY_ID,
                //     subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                // }
                let payload = {
                    data:request_payload               
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/course/select"
                console.log("base_url", base_url);

                const resp = await axios.post(base_url, payload, { headers })
                return resp?.data
            } catch (err) {
                console.log("Error ===>>>", err);
            }

        }
        catch (err) {
            console.log("Service Error in course select=====", err)
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
                "quote": message?.order?.quote,
                "fulfillments": message?.order?.fulfillments
            }
            const filterQuery = {
                $or: [
                    { "transaction_id": context?.transaction_id },
                    { "message_id": context?.message_id }
                ]
            }
            await course_order.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, upsert_payload)
        }
        catch (err) {
            console.log("Service Error course on_select=====", err)
        }

    }

}

export default Service