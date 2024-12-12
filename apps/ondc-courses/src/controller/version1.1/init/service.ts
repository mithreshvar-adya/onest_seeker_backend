import { commonProtocolAPI, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { ENUM_ACTIONS,BAP_KEYS } from "@adya/shared";
import { CourseOrder } from "@adya/shared";
import { User } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";
import axios from "axios";

const course_order = CourseOrder.getInstance()
const user_model = User.getInstance()


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

    calculateAge(dob: string): number {
      const [day, month, year] = dob.split('-').map(Number);
      
      const dobDate = new Date(year, month - 1, day); // month is zero-indexed
  
      const today = new Date();

      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDifference = today.getMonth() - dobDate.getMonth();
  
      // Adjust age if birthday hasn't occurred yet this year
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
          age--;
      }
      return age;
    }

    async init(protocol_context, message, user_id) {
        try {

            let userData = await user_model.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { id: user_id })

            const age = userData?.dob ? this.calculateAge(userData.dob) : 23;
            
            let fulfillmentData = [
                {
                  "customer": {
                    "person": {
                      "name": userData?.first_name + " " + userData?.last_name || "Krish",
                      "age": age.toString(),
                      "gender": userData?.gender || "Male",
                      "tags": [
                        {
                          "descriptor": {
                            "code": "professional-details",
                            "name": "Professional Details"
                          },
                          "list": [
                            {
                              "descriptor": {
                                "code": "profession",
                                "name": "profession"
                              },
                              "value": userData?.profession || "student"
                            }
                          ],
                          "display": true
                        }
                      ]
                    },
                    "contact": {
                      "phone": userData?.mobile_number,
                      "email": userData?.email
                    }
                  }
                }
              ]
            
            message.order.fulfillments = fulfillmentData

            let request_payload = {
                context: protocol_context,
                message: message,
            };
            let orderData = {
                billing: message?.order?.billing,
                init_req: request_payload
            };

            let query = {
                transaction_id: protocol_context?.transaction_id,
            };
            await course_order.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, orderData);

            console.log("dlslk",JSON.stringify(request_payload));
            
            // let resp = await commonProtocolAPI(
            //     protocol_context.bpp_uri,
            //     ENUM_ACTIONS.INIT,
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

              const payload = {
                  base_url: protocol_context?.bpp_uri,
                  action: ENUM_ACTIONS.INIT,
                  data: request_payload,
                  subscriber_id: protocol_context?.bap_id,
                  subscriber_ukid: BAP_KEYS.LEARNING_UNIQUE_KEY_ID,
                  subscriber_private_key: BAP_KEYS.PRIVATE_KEY
              }
              const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/course/init"
              console.log("base_url", base_url);

              const resp = await axios.post(base_url, payload, { headers })
              return resp?.data
          } catch (err) {
              console.log("Error ===>>>", err);
          }

          //   let reqBody = {
          //     bpp_uri: protocol_context.bpp_uri,
          //     action: ENUM_ACTIONS.INIT,
          //     request_payload: request_payload,
          //     bap_id: protocol_context.bap_id
          // }

          // let commonProcotolUrl = GlobalEnv?.COMMON_PROTOCOL_URL
          // try {
          //     let api_response = await axios.post(commonProcotolUrl, reqBody);
          //     return api_response?.data
          // }
          // catch (err) {
          //     console.log("Error in course init ===>>>", err)
          //     let err_resp = err?.response?.data || apiResponse.ONEST_ONDC_FAILURE_RESP()
          //     return (err_resp);
          // }

        }
        catch (err) {
            console.log("Service Error in course init=====", err)
        }

    }

    async on_init(context, message) {
        try {
            const payments = message?.order?.payments;
            const lastPaymentStatus = payments ? payments[payments.length - 1]?.status : "NOT-PAID";

            let upsert_payload = {
                "oninit_resp": {
                    "context": context,
                    "message": message
                },
                billing: message?.order?.billing,
                payments: message?.order?.payments,
                payment_status: lastPaymentStatus,
                total_price: parseFloat(message?.order?.quote?.price?.value)
            }
            let filterQuery = {
                "transaction_id": context?.transaction_id,
            }
            await course_order.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,filterQuery, upsert_payload)
        }
        catch (err) {
            console.log("Service Error for course on_init=====", err)
        }

    }

}

export default Service