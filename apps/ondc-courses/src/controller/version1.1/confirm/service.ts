import { commonProtocolAPI, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { ENUM_ACTIONS, BAP_KEYS } from "@adya/shared";
import { CourseOrder, CourseCache } from "@adya/shared";
import { apiResponse } from "@adya/shared";
import { SendEmailOrSMS } from "../../../shared/utils/helpers/email_or_sms";
import axios from "axios";
import { error } from "console";
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

    async confirm(protocol_context, message, user_id) {
        try {

            const query = {
                transaction_id: protocol_context?.transaction_id,
            };
            const courseOrder = await course_order.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query)
            const onInitpayments = courseOrder?.oninit_resp?.message?.order?.payments
            const lastPaymentStatus = onInitpayments ? onInitpayments[onInitpayments.length - 1]?.status : "NOT-PAID";
            
            message.order.billing = courseOrder?.billing
            console.log("courseOrder",JSON.stringify(courseOrder?.oninit_resp));
            const confirm_fulfillments=courseOrder?.oninit_resp?.message?.order?.fulfillments
            confirm_fulfillments.forEach(fulfillment => {
                // Remove the 'type' property
                delete fulfillment.type;
            
                // Remove the 'tags' property inside 'customer.person'
                if (fulfillment.customer?.person) {
                    delete fulfillment.customer.person.tags;
                }
            
                // Remove the 'agent' property
                delete fulfillment.agent;
            });
            message.order.fulfillments = confirm_fulfillments
            message.order.payments = [
                {
                    "params": {
                        "amount": courseOrder?.quote?.price?.value,
                        "currency": "INR"
                    },
                    "status": lastPaymentStatus
                }
            ]
            const request_payload = {
                context: protocol_context,
                message: message,
            };
            if (lastPaymentStatus == "NOT-PAID") {
                console.log("Payment Status is NOT-PAID ----- So restricting course confirm api call--------> transaction_id = ",protocol_context?.transaction_id,courseOrder?.items?.course_id); 
                const resp = {
                    context: protocol_context,
                    message: {
                        "ack": {
                            "status": "NACK"
                        }
                    },
                    error: {
                        message: "Payment Status is NOT-PAID"
                    }
                }
                return resp
            }

            const orderData = {
                confirm_req: request_payload
            };

            await course_order.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, orderData);

            // const resp = await commonProtocolAPI(
            //     protocol_context.bpp_uri,
            //     ENUM_ACTIONS.CONFIRM,
            //     request_payload,
            //     protocol_context.bap_id,
            //     BAP_KEYS.LEARNING_UNIQUE_KEY_ID,
            //     BAP_KEYS.PRIVATE_KEY
            // )
            // return resp

            try {
                const headers = {
                    'Content-Type': 'application/json'
                };
  
                // const payload = {
                //     base_url: protocol_context?.bpp_uri,
                //     action: ENUM_ACTIONS.CONFIRM,
                //     data: request_payload,
                //     subscriber_id: protocol_context?.bap_id,
                //     subscriber_ukid: BAP_KEYS.LEARNING_UNIQUE_KEY_ID,
                //     subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                // }
                let payload = {
                    data:request_payload               
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/course/confirm"
                console.log("base_url", base_url);
  
                const resp = await axios.post(base_url, payload, { headers })
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

            // let commonProcotolUrl = global_env?.COMMON_PROTOCOL_URL
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
            console.log("Service Error in course confirm=====", err)
        }

    }

    async on_confirm(context, message) {
        try {
            const add_ons = message?.order?.items[0]?.["add-ons"]
            const course_outline = []
            const prelim_quiz = []
            for (let index = 0; index < add_ons?.length; index++) {
                const element = add_ons[index];
                if (element?.id == "course-outline") {
                    course_outline.push(element?.descriptor)
                } else if (element?.id == "prelim-quiz") {
                    prelim_quiz.push(element?.descriptor)
                }
            }

            const fulfillStops = message?.order?.fulfillments[0]?.stops
            const fulfillTags = message?.order?.fulfillments[0]?.tags
            const courseMaterials = []
            let certificateCheck = false
            for (let index = 0; index < fulfillStops?.length; index++) {
                const element = fulfillStops[index];
                const data = element?.instructions
                data.id = element.id
                courseMaterials.push(data)
            }
            const course_completion_details = []
            for (let index = 0; index < fulfillTags?.length; index++) {
                const element = fulfillTags[index];

                if (element?.descriptor?.code == "course-completion-details") {
                    let data 
                    for (let inner_index = 0; inner_index < element?.list?.length; inner_index++) {
                        const tag_element = element?.list[inner_index];
                        if (tag_element?.descriptor?.code == "course-certificate") {
                            data.course_certificate = tag_element?.value
                            certificateCheck = true
                        }else if (tag_element?.descriptor?.code == "course-badge") {
                            data.course_badge = tag_element?.value
                        }else if (tag_element?.descriptor?.code == "completion-timestamp") {
                            data.completion_timestamp = tag_element?.value
                        }
                    }
                    data.display = element?.display
                    course_completion_details.push(data)
                }
                
            }

            const upsert_payload = {
                "order_id": message?.order?.id,
                "state": "Created",
                "fulfillment_status": message?.order?.fulfillments[0]?.state?.descriptor,
                "createdAt": new Date(),
                "is_enrolled": true,
                "payment_status": "PAID",
                "onconfirm_resp": {
                    "context": context,
                    "message": message
                },
                "items.course_materials": courseMaterials,
                "items.course_completion_details": course_completion_details,
                "fulfillments": message?.order?.fulfillments,
                "items.course_outline": course_outline,
                "items.prelim_quiz": prelim_quiz
            }

            if (certificateCheck) {
                upsert_payload["is_certificate_available"] = certificateCheck
            }

            const filterQuery = {
                "transaction_id": context?.transaction_id,
            }

            await course_order.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, upsert_payload)
            
            const resp = await course_order.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, {"order_id": message?.order?.id})
            const course_cache_updateOperation = {
                $addToSet: { purchased_userIds: resp?.user_id}
            };
            const course_cache_query = {
                "course_id": resp?.items?.course_id
            }
            await SendEmailOrSMS("COURSE_ENROLLMENT", resp?.user_id, message?.order?.id);
            await course_cache.updateCourseCache(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, course_cache_query, course_cache_updateOperation)
        }
        catch (err) {
            console.log("Service Error for course on_confirm=====", err)
        }

    }

}

export default Service