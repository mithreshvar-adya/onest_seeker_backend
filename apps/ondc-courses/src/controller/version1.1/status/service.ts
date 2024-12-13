import { ENUM_ACTIONS,BAP_KEYS, ONDC_LAYER_BASE_URL} from "@adya/shared";
import { CourseOrder } from "@adya/shared";
import { apiResponse } from "@adya/shared";
import axios from "axios";
import { commonProtocolAPI } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";
const course_order = CourseOrder.getInstance()

class Service {
    private static instance: Service | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Static method to get the singleton instance
    public static getInstance(): Service {
        if (this.instance === null) {
        this.instance = new Service();
        }
        return this.instance;
    }

    async status(protocol_context, message) {
        try {
            let request_payload = {
                context: protocol_context,
                message: message,
            };
                           
            // let reqBody = {
            //     bpp_uri: protocol_context.bpp_uri,
            //     action: ENUM_ACTIONS.STATUS,
            //     request_payload: request_payload,
            //     bap_id: protocol_context.bap_id
            // }

            // let resp = await commonProtocolAPI(
            //     protocol_context.bpp_uri,
            //     ENUM_ACTIONS.STATUS,
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
                //     action: ENUM_ACTIONS.STATUS,
                //     data: request_payload,
                //     subscriber_id: protocol_context?.bap_id,
                //     subscriber_ukid: BAP_KEYS.LEARNING_UNIQUE_KEY_ID,
                //     subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                // }
                let payload = {
                    data:request_payload               
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/course/status"
                console.log("base_url", base_url);

                const resp = await axios.post(base_url, payload, { headers })
                return resp?.data
            } catch (err) {
                console.log("Error ===>>>", err);
            }

        }
        catch(err){
            console.log("Service Error in course status =====", err)
        }

    }

    async on_status(context, message){
        try {

            let fulfillTags = message?.order?.fulfillments[0]?.tags
            let course_completion_details = []
            let certificateCheck = false
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

            let upsert_payload = {
                "fulfillment_status": message?.order?.fulfillments[0]?.state?.descriptor,
                "updatedAt": message?.order?.fulfillments[0]?.state?.updated_at,
                "onstatus_resp": {
                    "context": context,
                    "message": message
                },
                "items?.course_completion_details": course_completion_details,
                "fulfillments": message?.order?.fulfillments
            }
            if (certificateCheck) {
                upsert_payload["is_certificate_available"] = certificateCheck
            }

            let filterQuery = {
                "transaction_id": context?.transaction_id,
                "order_id": message?.order?.id
            }
            await course_order.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, upsert_payload)
        }
        catch(err){
            console.log("Service Error course on_status=====", err)
        }

    }
}

export default Service