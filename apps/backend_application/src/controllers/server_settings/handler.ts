import service from './service';
import { apiResponse, JsonWebToken } from "@adya/shared";



const newService = service.getInstance();

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

    async createServerSettings(req, res, next) {
        try {
            const { body } = req
            console.log(body)
            const resp = await newService.createServerSettings(body)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Server Settings Created Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async getServerSettings(req, res, next) {
        try {
            const { params } = req
            const resp = await newService.getServerSettings({ id: params?.id })
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async updateServerSettings(req, res, next) {
        try {
            const { body, params } = req
            
            const resp = await newService.getServerSettings({ id: params?.id })
            if (resp) {
                const query = {
                    id: resp?.id
                }
                await newService.updateServerSettings(query, body)
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

    async listServerSettings(req, res, next) {
        try {
            const { query } = req
            const filterQuery = {}
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            const sort = {}
            const resp = await newService.listServerSettings(filterQuery, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    // async delete(req, res, next) {
    //     try {
    //         const { params } = req
    //         const resp = await newService.delete({ id: parseInt(params?.id) })
    //         return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
    //     } catch (err) {
    //         console.log("Handler Error ===========>>>> ", err)
    //         return res.status(500).json(apiResponse.FAILURE_RESP({}, {
    //             name: "Handler Error",
    //             message: `${err}`
    //         }, "Handler error"))
    //     }
    // }

    async createUserServerSettings(req, res, next) {
        try {
            const { body } = req
            console.log(body)
            const resp = await newService.createUserServerSettings(body)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "User Server Settings Created Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async getUserServerSettings(req, res, next) {
        try {
            const { params } = req
            const resp = await newService.getUserServerSettings({ id: params?.id })
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "success"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async updateUserServerSettings(req, res, next) {
        try {
            const { body, params } = req
            
            const resp = await newService.getUserServerSettings({ id: params?.id })
            if (resp) {
                const query = {
                    id: resp?.id
                }
                await newService.updateUserServerSettings(query, body)
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

    async listUserServerSettings(req, res, next) {
        try {
            const { query } = req
            const filterQuery = {}
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            const sort = {}
            const resp = await newService.listUserServerSettings(filterQuery, page_no, per_page, sort)
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