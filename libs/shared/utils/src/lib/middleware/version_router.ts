import { ONEST_VERSIONS } from "../ondc_signature/constant"

const ACTION_FAILURE_RESP = {
    "message": {
        "ack": {
            "status": "NACK"
        }
    },
    "error": {
        "type": "",
        "code": "",
        "path": "",
        "message": ""
    }
}

export const OndcOnestVersionHandlerMiddleware = (Version1point1Handler:any) =>
    async (req:any, res:any, next:any) => {
        try{
            console.log("\n===================== API "+req?.body?.context?.action+" Request Start ====================================");
            console.log(JSON.stringify(req?.body));
            console.log("===================== API Request End ====================================\n");

            let context = req?.body?.context
            
            let api_resp:any={} 

            if(ONEST_VERSIONS.v_1_1_0 == context?.version){                
                api_resp = await Version1point1Handler(req, res, next)
            }
            else{
                api_resp = ACTION_FAILURE_RESP
            }

            // console.log("\n===================== API "+req?.body?.context?.action+" Response Start ====================================");
            // console.log(JSON.stringify(api_resp));
            // console.log("===================== API Response End ====================================\n");
            
            return res.status(200).json(api_resp)        
    }
    catch(err){
        console.log("Version Handler Error =======>>>>", err)
        return res.status(200).json(ACTION_FAILURE_RESP)        
    }

}
export const OndcOnestVersionPayoloadValidatorMiddleware = (Version1point1Validator:any) =>
    async (req:any, res:any, next:any) => {
        try{
            console.log("\n===================== Entered Payload Validation ====================================");

            let context = req?.body?.context
            
            let validate_resp:any={} 

            if(ONEST_VERSIONS.v_1_1_0 == context?.version){
                validate_resp = await Version1point1Validator(req, res, next)
                if(validate_resp?.validation_flag==false){
                    console.log("payload validation failure ======================>")
                    ACTION_FAILURE_RESP.error.type = "Invalid request"
                    ACTION_FAILURE_RESP.error.code = "30000"
                    ACTION_FAILURE_RESP.error.message = JSON.stringify(validate_resp?.error_list)
                    return res.status(200).json(ACTION_FAILURE_RESP)      
                } else {
                    return next();
                }
            }
            else{
                validate_resp = ACTION_FAILURE_RESP
                return res.status(200).json({})       
            }            
    }
    catch(err){
        console.log("Version Handler Error =======>>>>", err)
        return res.status(200).json(ACTION_FAILURE_RESP)        
    }

}