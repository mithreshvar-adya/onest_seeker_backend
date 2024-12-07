import service from './service';
import { v4 as uuidv4 } from 'uuid';
import { apiResponse } from "@adya/shared";

const newService = service.getInstance();


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

    async track(req, res, next) {
        try {
            let { body } = req
            newService.on_track({})
            return apiResponse.ONEST_ONDC_SUCCESS_RESP()
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return apiResponse.ONEST_ONDC_FAILURE_RESP("error_type", "error_code",err, "error_message")
        }
    }
}

export default Handler