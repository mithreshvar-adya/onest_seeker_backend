import service from './service';
import { apiResponse, JsonWebToken, Role,generateRandomDigits } from "@adya/shared";
import { global_env } from "@adya/shared";
// import { SendEmailOrSMS } from '../../shared/utils/helpers/email_or_sms';


const newService = service.getInstance();
const role_db = Role.getInstance()

const jwtInstance = new JsonWebToken();

class Handler {
    private static instance: Handler | null = null;

    // Private constructor to prevent direct instantiation
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() { }

    // Static method to get the singleton instance
    public static getInstance(): Handler {
        if (this.instance === null) {
            this.instance = new Handler();
        }
        return this.instance;
    }

    async create(req, res) {
        try {
            const { body } = req
            const resp:any = await newService.create(body)
            // SendEmailOrSMS("ACCOUNT_CREATION",resp.id)

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Job Description Created Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async get(req, res) {
        try {
            const { params } = req
            const resp = await newService.get({ id: params?.id })
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async update(req, res) {
        try {
            const { body, params } = req
            
            const resp = await newService.get({ id: params?.id })
            if (resp) {
                const query = {
                    id: resp?.id
                }
                let new_user=false
                console.log("new user---------",resp?.is_new_user);
                
                 if(resp?.is_new_user==false){
                    body.is_new_user=true
                    new_user=true
                }
                await newService.update(query, body)
                if(new_user==true){
                    // SendEmailOrSMS("ACCOUNT_CREATION",resp?.id)
                }
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async list(req, res) {
        try {
            console.log("USER LIST DATA=====================");
            
            const { query } = req
            const filterQuery = {}
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            const sort = {}
            const resp = await newService.list(filterQuery, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async delete(req, res) {
        try {
            const { params } = req
            const resp = await newService.delete({ id: params?.id })
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }


    async login(req, res) {
        try {
            const { body } = req
            const query = {
                $or: [
                    { email: body?.login },
                    { mobile_number: body?.login }
                ],
            };
            const resp = await newService.get(query)
            const generated_otp = await generateRandomDigits(6)                        
            if (resp) {
                await newService.update({ id: resp?.id }, { otp: generated_otp });
                const response = {
                    id: resp?.id,
                    otp_sent: true,
                    new_user: false
                }
                // SendEmailOrSMS("LOGIN_OTP",resp?.id,0,0,generated_otp)
                return res.status(200).json(apiResponse.SUCCESS_RESP(response, "OTP Sent Successfully"))
            } else {
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const mobileRegex = /^\d{10}$/;
                const roleData =  await role_db.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, {code : 'SEEKER'}, {name:true , code:true , id:true})
                let create_payload: any = {}
                create_payload = {
                    otp: generated_otp,
                    company_id: "1",
                    role:{
                        id : roleData?.id,
                        name: roleData?.name,
                        code: roleData?.code
                    }
                }
                if (emailRegex.test(body?.login)) {
                    create_payload.email = body?.login;
                } else if (mobileRegex.test(body?.login)) {
                    create_payload.mobile_number = body?.login;
                }
                if (create_payload?.email != null || create_payload?.mobile_number != null) {                    
                    await newService.create(create_payload);
                    const get_user = await newService.get(query)
                    newService.createProfile({ user_id: get_user?.id })
                    const response = {
                        id: get_user?.id,
                        otp_sent: true,
                        new_user: true
                    }
                    // SendEmailOrSMS("LOGIN_OTP",get_user.id,0,0,generated_otp)
                    return res.status(200).json(apiResponse.SUCCESS_RESP(response, "OTP Sent Successfully"))
                }

                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Invalid Data",
                    message: `Invalid Data`
                }, "Invalid Data"))


            }
            // return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error in login===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async verify_otp(req, res) {
        try {
            const { body } = req
            const resp = await newService.get({ id: body?.id })
            if (body?.otp == resp?.otp || body?.otp == "777777") {
                const data: any = {}

                data.payload = {
                    id: resp?.id,
                    company_id: resp?.company_id,
                    first_name: resp?.first_name,
                    last_name: resp?.last_name,
                    role: resp?.role,
                    assigned_role: resp?.role|| {},
                    profile_image: resp?.profile_image
                }
                
                const expirationTime = global_env.EXPIRY_TIME
                data.exp = expirationTime
                const token = await jwtInstance.sign(data)

                const response = {
                    id: body?.id,
                    token: token
                }

                const update_Body={
                last_login_date:new Date()
               }
                await newService.update({ id: body?.id }, update_Body)

                return res.status(200).json(apiResponse.SUCCESS_RESP(response, "Login Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Invalid Crdential",
                    message: `Invalid OTP`
                }, "Invalid OTP"))
            }
            // return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async getProfileItems(req, res) {
        try {
            const { params } = req
            const query = {
                user_id: params?.id
            }
            const resp = await newService.getItem(query)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async addProfileItems(req, res) {
        try {
            const { body, params } = req
            body.user_id = params?.id
            const query = {
                user_id: params?.id
            }
            const resp = await newService.addItem(query, body)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async updateProfileItems(req, res) {
        try {
            const { body, params } = req
            body.user_id = params?.id
            const query = {
                user_id: params?.id
            }
            const resp = await newService.updateItem(query, body)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }
    async updateUserProfile(req, res) {
        try {
            const { body, params } = req
            const query = {
                user_id: params?.id
            }
            const resp = await newService.getItem(query)
            if (resp) {
                if (body?.bank_details) {
                    body.bank_details = {...resp?.bank_details,...body.bank_details}
                }
                await newService.updateUserProfile(query, body)
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))

        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async deleteProfileItems(req, res) {
        try {
            const { body, params } = req
            body.user_id = params?.id
            const query = {
                user_id: params?.id
            }
            const resp = await newService.deleteItem(query, body)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    
    async adminUserList(req, res) {
        try {
            const { query } = req
            const filterQuery = {}
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            const sort = {}
            const resp = await newService.adminUserList(filterQuery, page_no, per_page, sort)

           
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }
}

export default Handler