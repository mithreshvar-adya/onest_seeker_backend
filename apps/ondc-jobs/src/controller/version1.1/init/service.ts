import { commonProtocolAPI, ONDC_LAYER_BASE_URL } from "@adya/shared";
import { ENUM_ACTIONS, BAP_KEYS } from "@adya/shared";
import { Jobs } from "@adya/shared";
import { User, UserProfile,apiResponse } from "@adya/shared";
import { GlobalEnv } from "../../../config/env";
import axios from "axios"; 
import { json } from "node:stream/consumers";

const job_module = new Jobs()
const user_model = new User()
const user_profile = new UserProfile()



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

    calculateTotalExperience(startDate: Date, endDate: Date): number {
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      let years = end.getFullYear() - start.getFullYear();
  
      if (end.getMonth() < start.getMonth() || (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())) {
        years--;
      }
        
      return years;
    }
  

  async init(protocol_context, message, user_id, application_details) {
        try {

          let userData = await user_model.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,{ id: user_id })
          let userProfile = await user_profile.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,{ user_id: user_id })

          const age = userData?.dob ? this.calculateAge(userData.dob) : 23;
          
          const totalExperience = userProfile?.work_experience?.reduce((total, experience) => {
            if (!experience.start_date) {
              return total;
            }

            const endDate = experience.end_date || new Date();           
            const expYears = this.calculateTotalExperience(experience.start_date, endDate);
            return total + expYears;
            
          }, 0) || 0;

          let fulfillmentData = [
            {
              "id": application_details?.fulfillment_ids?.[0],
              "customer": {
                "person": {
                  "name": application_details?.applicant_name || userData?.first_name +" "+ userData?.last_name,
                  "age": age.toString(),
                  "gender": userData?.gender || "",
                  "skills": application_details?.skills,
                  "languages": application_details?.languages,
                  "tags": [
                    {
                      "descriptor": {
                        "code": "emp-details"
                      },
                      "list": [
                        {
                          "descriptor": {
                            "code": "expected-salary"
                          },
                          "value": application_details?.expected_salary || userProfile?.work_preference?.[0]?.expected_salary
                        },
                        {
                          "descriptor": {
                            "code": "total-experience"
                          },
                          "value": application_details?.total_experience || totalExperience.toString()
                        }
                      ]
                    },
                    {
                      "descriptor": {
                        "code": "documents",
                        "name": "Documents"
                      },
                      "list": [
                        {
                          "descriptor": {
                            "code": "doc-type"
                          },
                          "value": "resume"
                        },
                        {
                          "descriptor": {
                            "code": "link"
                          },
                          "value": application_details?.resume_link || userProfile?.additional_info?.[0]?.resume_link || ""
                        },
                        {
                          "descriptor": {
                            "code": "file-format"
                          },
                          "value": "pdf"
                        }
                      ]
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

          console.log("dfsa",JSON.stringify(fulfillmentData));
          
            
            message.order.fulfillments = fulfillmentData

            let request_payload = {
                context: protocol_context,
                message: message,
            };
            let orderData = {
                init_req: request_payload
            };

            let query = {
                transaction_id: protocol_context?.transaction_id,
            };
            await job_module.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, orderData);

            // let resp = await commonProtocolAPI(
            //     protocol_context.bpp_uri,
            //     ENUM_ACTIONS.INIT,
            //     request_payload,
            //     protocol_context.bap_id,
            //     BAP_KEYS.UNIQUE_KEY_ID,
            //     BAP_KEYS.PRIVATE_KEY
            // )

            // return resp

            let reqBody = {
              bpp_uri: protocol_context.bpp_uri,
              action: ENUM_ACTIONS.INIT,
              request_payload: request_payload,
              bap_id: protocol_context.bap_id
          }

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

        //   let resp = await commonProtocolAPI(
        //     protocol_context.bpp_uri,
        //     ENUM_ACTIONS.INIT,
        //     request_payload,
        //     protocol_context.bap_id,
        //     BAP_KEYS.JOB_UNIQUE_KEY_ID,
        //     BAP_KEYS.PRIVATE_KEY
        // )
        // return resp

            try {
              const headers = {
                  'Content-Type': 'application/json'
              };
            
              // const payload = {
              //     base_url: protocol_context.bpp_uri,
              //     action: ENUM_ACTIONS.INIT,
              //     data: request_payload,
              //     subscriber_id: protocol_context.bap_id,
              //     subscriber_ukid: BAP_KEYS.JOB_UNIQUE_KEY_ID,
              //     subscriber_private_key: BAP_KEYS.PRIVATE_KEY
              // }
              let payload = {
                data:request_payload               
            }
              const base_url = ONDC_LAYER_BASE_URL.base_url + "/ondc_layer/job/init"
              console.log("base_url", base_url);
            
              const resp = await axios.post(base_url, payload, { headers })
              console.log("ondc layer resp", resp?.data)
              return resp?.data
            } catch (err) {
                console.log("Error ===>>>", err);
            }
        }
        catch (err) {
            console.log("Service Error in job init=====", err)
        }

    }

    async on_init(context, message) {
        try {
          console.log("Entered on_init service--------------");
          
            let fulfillments = message?.order?.fulfillments

            let upsert_payload = {
                "oninit_resp": {
                    "context": context,
                    "message": message
                },
              fulfillments: fulfillments,
              fulfillment_status: fulfillments?.[0]?.state?.descriptor
            }
            let filterQuery = {
                "transaction_id": context?.transaction_id,
            }
          let update_resp=  await job_module.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, upsert_payload)
          console.log("updated successfully---------", update_resp);
          
        }
        catch (err) {
            console.log("Service Error for job on_init=====", err)
        }

    }

}

export default Service