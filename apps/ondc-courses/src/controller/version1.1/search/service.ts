import { commonProtocolAPI, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { PROTOCOL_BASE_URL } from "@adya/shared";
import { ENUM_ACTIONS, BAP_KEYS } from "@adya/shared";
import axios from "axios";
import { apiResponse } from "@adya/shared";
import { CourseCache } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";


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

    async search(protocol_context, message) {
        try {
            const request_payload = {
                context: protocol_context,
                message: message,
            };


            const bpp_uri = PROTOCOL_BASE_URL.production

            const reqBody = {
                bpp_uri: bpp_uri,
                action: ENUM_ACTIONS.SEARCH,
                request_payload: request_payload,
                bap_id: protocol_context.bap_id
            }

            // let commonProcotolUrl = GlobalEnv?.COMMON_PROTOCOL_URL
            // try {
            //     let api_response = await axios.post(commonProcotolUrl, reqBody);
            //     return api_response?.data
            // }
            // catch (err) {
            //     console.log("Error in course search ===>>>", err)
            //     let err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
            //     return (err_resp);
            // }

            // const resp = await commonProtocolAPI(
            //     bpp_uri,
            //     ENUM_ACTIONS.SEARCH,
            //     request_payload,
            //     protocol_context.bap_id,
            //     BAP_KEYS.LEARNING_UNIQUE_KEY_ID,
            //     BAP_KEYS.PRIVATE_KEY
            // )

            try {
                const headers = {
                    'Content-Type': 'application/json'
                };

                const payload = {
                    base_url: bpp_uri,
                    action: ENUM_ACTIONS.SEARCH,
                    data: request_payload,
                    subscriber_id: protocol_context.bap_id,
                    subscriber_ukid: BAP_KEYS.LEARNING_UNIQUE_KEY_ID,
                    subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/course/search"
                console.log("base_url", base_url);

                const resp = await axios.post(base_url, payload, { headers })
                console.log("resp", resp?.data)
                return resp?.data
            } catch (err) {
                console.log("Error ===>>>", err);
            }

        }
        catch (err) {
            console.log("Service Error in course search =====", err)
        }

    }

    async on_search(payload) {
        try {
            const context = payload?.context
            const message = payload?.message

            const providers_arr = message?.catalog?.providers || []
            await Promise.all(
                providers_arr.map(async (providerData) => {
                    const providerID = providerData?.id
                    const providerDescp = providerData?.descriptor

                    const items = providerData?.items || []
                    await Promise.all(
                        items.map(async (courseData) => {

                            let contentMetadata = {}

                            for (let index = 0; index < courseData?.tags?.length; index++) {

                                const tagElement = courseData?.tags[index];
                                const learner_level = []
                                const prerequisite = []
                                const lang_code = []
                                const course_duration = []
                                const learning_objective = []
                                if (tagElement?.descriptor?.code == "content-metadata") {

                                    const listArray = tagElement?.list
                                    for (let innerIndex = 0; innerIndex < listArray?.length; innerIndex++) {

                                        const listElement = listArray[innerIndex];
                                        if (listElement?.descriptor?.code == "learner-level") {
                                            learner_level.push(listElement?.value)
                                        } else if (listElement?.descriptor?.code == "learning-objective") {
                                            learning_objective.push(listElement?.value)
                                        } else if (listElement?.descriptor?.code == "prerequisite") {
                                            prerequisite.push(listElement?.value)
                                        } else if (listElement?.descriptor?.code == "lang-code") {
                                            lang_code.push(listElement?.value)
                                        } else if (listElement?.descriptor?.code == "course-duration") {
                                            course_duration.push(listElement?.value)
                                        }
                                    }
                                    contentMetadata = {
                                        learner_level: learner_level,
                                        prerequisite: prerequisite,
                                        lang_code: lang_code,
                                        course_duration: course_duration,
                                        learning_objective: learning_objective,
                                        display: tagElement?.display
                                    }
                                }

                            }
                            const fulfillments = providerData?.fulfillments || []
                            const fulfillment_ids = courseData?.fulfillment_ids || []

                            const matchedFulfillments = fulfillments?.filter(fulfillment =>
                                fulfillment_ids?.includes(fulfillment?.id)
                            );


                            const categories = providerData?.categories || []
                            const category_ids = courseData?.category_ids || []
                            const matchedcategories = categories?.filter(category =>
                                category_ids?.includes(category?.id)
                            );


                            const coursePayload = {
                                context: context,
                                provider_id: providerID,
                                provider_descriptor: providerDescp,
                                course_id: courseData?.id,
                                course_descriptor: courseData?.descriptor,
                                creator_descriptor: courseData?.creator?.descriptor,
                                content_metadata: contentMetadata,
                                fulfillments: matchedFulfillments,
                                categories: matchedcategories,
                                category_ids: courseData?.category_ids,
                                price: courseData?.price,
                                quantity: courseData?.quantity,
                                ratings: parseFloat(courseData?.rating),
                                rateable: courseData?.rateable,
                                total_price: parseFloat(courseData?.price?.value)
                            }

                            const query = {
                                provider_id: providerID,
                                course_id: courseData?.id,
                            }

                            await course_cache.upsertCourseCache(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, coursePayload)

                        })
                    )
                })
            )

        }
        catch (err) {
            console.log("Service Error course search=====", err)
        }

    }
}

export default Service