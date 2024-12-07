import { CourseOrder, CourseCache } from "@adya/shared";
import { GlobalEnv } from "../../config/env";

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

    async select(message_id, user_id,course_id) {
        try {

            console.log("Inside L1 adaptor select service----->");
            
            let cacheOrderData = await course_cache.findOne(GlobalEnv.MONGO_DB_URL,GlobalEnv.MONGO_DB_NAME,{ course_id: course_id })
            if (cacheOrderData == null) {
                cacheOrderData = await course_cache.findOne(GlobalEnv.MONGO_DB_URL,GlobalEnv.MONGO_DB_NAME,{ course_id: "XHFZS7NF" })
            }
            const itemData = {
                course_id: cacheOrderData?.course_id,
                course_descriptor: cacheOrderData?.course_descriptor,
                creator_descriptor: cacheOrderData?.creator_descriptor,
                content_metadata: cacheOrderData?.content_metadata,
                price: cacheOrderData?.price,
                quantity: cacheOrderData?.quantity,
                ratings: cacheOrderData?.ratings,
                fulfillments: cacheOrderData?.fulfillments,
            }
            const orderData = {
                message_id: message_id,
                provider_id: cacheOrderData?.provider_id,
                provider_descriptor: cacheOrderData?.provider_descriptor,
                items: itemData,
                user_id: user_id,
            };

            await course_order.createCourse(GlobalEnv.MONGO_DB_URL,GlobalEnv.MONGO_DB_NAME,orderData);
        }
        catch (err) {
            console.log("Service Error in select in sse=====", err)
        }

    }

}

export default Service