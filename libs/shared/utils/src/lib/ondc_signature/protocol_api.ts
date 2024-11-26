// @ts-check
import { createAuthorizationHeader } from "./signature_generate_and_verification";
import axios from 'axios'
import CustomLogs from "../middleware/custom_logs";
import * as crypto from 'crypto';
import { TELEMETRY_BASE_URL } from './constant';


const commonProtocolAPI = async (baseUrl:string, action:string, data:any, subscriber_id:string, subscriber_ukid:string, subscriber_private_key:string) => {

    console.log("baseUrl",baseUrl);
    console.log(" action,",action);
    console.log(" data:any,",data, );
    console.log(" subscriber_id, ",subscriber_id, );
    console.log("  subscriber_ukid, ",subscriber_ukid, );
    console.log("  subscriber_private_key",subscriber_private_key);

    const authHeader = await createAuthorizationHeader(data, subscriber_id, subscriber_ukid, subscriber_private_key);
    console.log("new Signature ----<<<", authHeader)
    
    let api_request = {
        baseURL: baseUrl,
        url: action,
        method: "POST",
        headers: {
            Authorization: authHeader,
            "Accept": "application/json"
        },
        data: data
    };
    // console.log("\n===================== API  Start ====================================");
    console.log("api_request=====================================>",JSON.stringify(api_request));
    // console.log("===================== API End ====================================\n");

    CustomLogs.writeRetailLogsToONDC(JSON.stringify(data), action)
    
    try {
        const startTimeInNanoSeconds = process.hrtime.bigint();
        let api_response = await axios(api_request);
        const endTimeInNanoSeconds = process.hrtime.bigint();
        console.log("Protocol Base url------>",baseUrl);
        
        console.log("===========CommonProtocolAPI_Log=============",api_response?.data);

        let response = {
            status: api_response?.status,
            statusText: api_response?.statusText || "OK",
            context: data?.context,
            message: api_response?.data?.message,
            error: api_response?.data?.error
        }
        try{
            console.log("Telemetry ----------------->");
            
            let telemetry_data={
                start_time:startTimeInNanoSeconds.toString(),
                end_time:endTimeInNanoSeconds.toString(),
                context:data?.context
            }
    
            await telemetry(telemetry_data)
        }
        catch (err) {
            console.log("Error in telemetry ===>>>")
        }
        
        return response;
    } catch (err:any) {
        console.log("Error in protocol=====>>>>", err?.response?.data);
        if(err?.response?.data?.error?.code=="40001"){
            let response = {
                statusText: "Failure",
                context: data?.context,
                message: {
                    ack: {
                        status: "NACK"
                    }
                },
                error: {
                    type: "Action not applicable",
                    code: "40001",
                    path: "",
                    message: "API endpoint is not implemented by the BPP"
                }
            }
            return response
        }
        let response = {
            statusText: "Failure",
            context: data?.context,
            message: {
                ack: {
                    status: "NACK"
                }
            },
            error: err?.response?.data
        }
        return response
    }
}

const telemetry = async (data: any) => {
    try{
    console.log("Telemetry request----->", data);

    let context = data?.context;

    // Determine if the action does not start with "on"
    const isProvider = !context?.action?.startsWith('on');

    let senderId = isProvider ? context?.bap_id : context?.bpp_id;
    let recipientId = isProvider ? context?.bpp_id : context?.bap_id;
    let senderUri = isProvider ? context?.bap_uri : context?.bpp_uri;
    let recipientUri = isProvider ? context?.bpp_uri : context?.bap_uri;

    let spanUuid_data={
        ets: process.hrtime.bigint().toString(),
        pid: isProvider ? context?.bap_id : context?.bpp_id,
        messageId: context?.message_id,
        transactionId: context?.transaction_id
    }

    const jsonString = JSON.stringify(spanUuid_data);
    const span_uuid = crypto.createHash('md5').update(jsonString).digest('hex');

    console.log("span_uuid---------------", span_uuid);

    let request_host=""

  
    if(context?.domain=="ONDC:ONEST11"){
         request_host=isProvider ? "https://ondc.skillsetu.co" : "https://ondc-bap.skillsetu.co"
       
    }else{
        request_host=isProvider ? "https://ondc-jobs.skillsetu.co":"https://ondc-jobs-bap.skillsetu.co"
    }
    const observedTimeInNanoSeconds = process.hrtime.bigint();

    let telemetryPayload:any = {
        "data": {
            "events": [
                {
                    "resourceSpans": [
                        {
                            "resource": {
                                "attributes": [
                                    { "key": "eid", "value": { "stringValue": "API" } },
                                    { "key": "producer", "value": { "stringValue": senderId } },
                                    { "key": "domain", "value": { "stringValue": context?.domain } }
                                ]
                            },
                            "scopeSpans": [
                                {
                                    "spans": [
                                        {
                                            "name": context?.action,
                                            "traceId": context?.transaction_id,
                                            "spanId": context?.message_id,
                                            "span_uuid": span_uuid,
                                            "startTimeUnixNano": data?.start_time,
                                            "endTimeUnixNano": data?.end_time,
                                            "status": "OK",
                                            "attributes": [
                                                { "key": "sender.id", "value": { "stringValue": senderId } },
                                                { "key": "recipient.id", "value": { "stringValue": recipientId } },
                                                { "key": "sender.uri", "value": { "stringValue": senderUri } },
                                                { "key": "recipient.uri", "value": { "stringValue": recipientUri } },
                                                { "key": "sender.type", "value": { "stringValue": isProvider ? 'seeker' : 'provider' } },
                                                { "key": "recipient.type", "value": { "stringValue": isProvider ? 'provider' : 'seeker' } },
                                                { "key": "observedTimeUnixNano", "value": { "intValue": observedTimeInNanoSeconds.toString() } },
                                                { "key": "http.request.method", "value": { "stringValue": "post" } },
                                                { "key": "http.request.route", "value": { "stringValue": "/api/v1/onest_ondc/bap/" + context?.action } },
                                                { "key": "http.request.host", "value": { "stringValue": request_host} },
                                                { "key": "http.request.scheme", "value": { "stringValue": "https" } },
                                                { "key": "http.status.code", "value": { "intValue": 200 } }
                                            ],
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    if (data?.error) {
        let events = [
          {
            name: 'error',
            time: new Date().toISOString(),
            attributes: [
              {
                key: 'type',
                value: {
                  stringValue: data?.error?.type,
                },
              },
              {
                key: 'code',
                value: {
                  stringValue: data?.error?.code,
                },
              },
              {
                key: 'msg',
                value: {
                  stringValue: data?.error?.message,
                },
              },
            ],
          },
        ];
        telemetryPayload.events=events
      }

    const headers = { 'Content-Type': 'application/json' };
    console.log("Telemetry payload", JSON.stringify(telemetryPayload), TELEMETRY_BASE_URL.base_url);

    // Uncomment to send telemetry
    let telemetryResponse = await axios.post(TELEMETRY_BASE_URL.base_url, telemetryPayload, { headers });
    console.log("Telemetry response status", telemetryResponse?.status);
}
catch (err) {
    console.log("Error in telemetry===>>>")
   
}
    
};


export {
    commonProtocolAPI,
    telemetry
}