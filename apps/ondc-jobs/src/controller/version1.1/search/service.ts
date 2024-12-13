import { ONDC_LAYER_BASE_URL, PROTOCOL_BASE_URL } from "@adya/shared";
import { ENUM_ACTIONS, BAP_KEYS } from "@adya/shared";
import axios from "axios";
import { apiResponse } from "@adya/shared";
import { JobCache } from "@adya/shared";
import { commonProtocolAPI } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";

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
            console.log("req body ", JSON.stringify(reqBody));


            // let commonProcotolUrl = global_env?.COMMON_PROTOCOL_URL
            // try {
            //     let api_response = await axios.post(commonProcotolUrl, reqBody);
            //     return api_response?.data
            // }
            // catch (err) {
            //     console.log("Error in Job search ===>>>", err)
            //     let err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
            //     return (err_resp);
            // }
            // const resp = await commonProtocolAPI(
            //     bpp_uri,
            //     ENUM_ACTIONS.SEARCH,
            //     request_payload,
            //     protocol_context.bap_id,
            //     BAP_KEYS.JOB_UNIQUE_KEY_ID,
            //     BAP_KEYS.PRIVATE_KEY
            // )

            try {
                const headers = {
                    'Content-Type': 'application/json'
                };

                // const payload = {
                //     base_url: bpp_uri,
                //     action: ENUM_ACTIONS.SEARCH,
                //     data: request_payload,
                //     subscriber_id: protocol_context.bap_id,
                //     subscriber_ukid: BAP_KEYS.JOB_UNIQUE_KEY_ID,
                //     subscriber_private_key: BAP_KEYS.PRIVATE_KEY
                // }
                let payload = {
                    data:request_payload               
                }
                const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/job/search"
                console.log("base_url", base_url);

                const resp = await axios.post(base_url, payload, { headers })
                console.log("resp", resp?.data)
                return resp?.data
            } catch (err) {
                console.log("Error ===>>>", err);
            }
        }
        catch (err) {
            console.log("Service Error in job search =====", err)
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
                        items.map(async (jobData) => {

                            let contentMetadata = {}

                            const academic_eligibility = []
                            const job_requirements = []
                            const job_responsibilities = []
                            const listing_details = []
                            const salary_info = []
                            const emp_details = []
                            const document = []
                            const required_docs = []
                            for (let index = 0; index < jobData?.tags?.length; index++) {
                                const tagElement = jobData?.tags[index];
                                if (tagElement?.descriptor?.code == "academic-eligibility") {
                                    academic_eligibility.push(tagElement)
                                } else if (tagElement?.descriptor?.code == "job-requirements") {
                                    job_requirements.push(tagElement)
                                } else if (tagElement?.descriptor?.code == "job-responsibilities") {
                                    job_responsibilities.push(tagElement)
                                } else if (tagElement?.descriptor?.code == "listing-details") {
                                    listing_details.push(tagElement)
                                } else if (tagElement?.descriptor?.code == "salary-info") {
                                    salary_info.push(tagElement)
                                } else if (tagElement?.descriptor?.code == "emp-details") {
                                    emp_details.push(tagElement)
                                } else if (tagElement?.descriptor?.code == "document") {
                                    document.push(tagElement)
                                } else if (tagElement?.descriptor?.code == "required-docs") {
                                    required_docs.push(tagElement)
                                }
                            }
                            contentMetadata = {
                                academic_eligibility: academic_eligibility,
                                job_requirements: job_requirements,
                                job_responsibilities: job_responsibilities,
                                listing_details: listing_details,
                                salary_info: salary_info,
                                emp_details: emp_details,
                                document: document,
                                required_docs: required_docs,
                            }

                            const fulfillments = providerData?.fulfillments || []
                            const fulfillment_ids = jobData?.fulfillment_ids || []

                            const matchedFulfillments = fulfillments?.filter(fulfillment =>
                                fulfillment_ids?.includes(fulfillment?.id)
                            );


                            const locations = providerData?.locations || []
                            const location_ids = jobData?.location_ids || []
                            const matchedlocations = locations?.filter(category =>
                                location_ids?.includes(category?.id)
                            );


                            const jobPayload = {
                                context: context,
                                provider_id: providerID,
                                provider_descriptor: providerDescp,
                                job_id: jobData?.id,
                                job_descriptor: jobData?.descriptor,
                                content_metadata: contentMetadata,
                                fulfillments: matchedFulfillments,
                                locations: matchedlocations,
                                quantity: jobData?.quantity
                            }

                            const query = {
                                provider_id: providerID,
                                job_id: jobData?.id,
                            }

                            await job_cache.upsertJobCache(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, jobPayload)

                        })
                    )
                })
            )

        }
        catch (err) {
            console.log("Service Error job search=====", err)
        }

    }
}

export default Service