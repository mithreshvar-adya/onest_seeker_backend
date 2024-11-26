import service from './service';
import { apiResponse,JsonWebToken } from "@adya/shared";

const newService = service.getInstance();
const jwtInstance = new JsonWebToken();

class Handler {

    private static instance: Handler | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() { }

    // Static method to get the singleton instance
    public static getInstance(): Handler {
        if (this.instance === null) {
            this.instance = new Handler();
        }
        return this.instance;
    }

    async create(req, res, next) {
        try {
            let { body,headers } = req
            let decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
            let resp = await newService.create(body)
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "ModuleMaster Created Successfully"))
        } catch (err) {
            console.log("Handler Error in create ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in create",
                message: `${err}`
            }, "Handler error in create"))
        }
    }

    async get(req, res, next) {
        try {
            let { body, params ,headers} = req
            let decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
            let getModuleMaster = await newService.get({ id: params?.id })
            if (getModuleMaster) {
                return res.status(200).json(apiResponse.SUCCESS_RESP(getModuleMaster, "ModuleMaster Retrieved Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
        } catch (err) {
            console.log("Handler Error in get ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in get",
                message: `${err}`
            }, "Handler error in get"))
        }
    }

    async list(req, res, next) {
      try {
          let { query,headers } = req
          let decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);

          console.log(decoded);
          
          let filterQuery: any = {
            created_by_id: decoded?.id
          }
          
          let page_no = parseInt(query?.page_no) || 1;
          let per_page = parseInt(query?.per_page) || 10;
          let sort = [
              { "createdAt": 'desc' },
              { "updatedAt": 'desc' },
          ]
          
          let resp = await newService.list(filterQuery, page_no, per_page, sort)
          return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "ModuleMasters Retrieved Successfully"))
      } catch (err) {
          console.log("Handler Error in list ===========>>>> ", err)
          return res.status(500).json(apiResponse.FAILURE_RESP({}, {
              name: "Handler Error in list",
              message: `${err}`
          }, "Handler error in list"))
      }
    }

    async update(req, res, next) {
        try {
            let { body, params,headers } = req
            let decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
            let getModuleMaster = await newService.get({ id: params?.id })
            if (getModuleMaster) {
                let query = {
                    id: getModuleMaster?.id
                }
                let response = await newService.update(query, body)
                return res.status(200).json(apiResponse.SUCCESS_RESP(response, "ModuleMaster Updated Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
        } catch (err) {
            console.log("Handler Error in update ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in update",
                message: `${err}`
            }, "Handler error in update"))
        }
    }

    async delete(req, res, next) {
        try {
            let { params,headers } = req
            let decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
            let getModuleMaster = await newService.get({ id: params?.id })
            if (getModuleMaster) {
                let query = {
                    id: getModuleMaster?.id
                }
                let Delete = await newService.delete(query)
                return res.status(200).json(apiResponse.SUCCESS_RESP(Delete, "ModuleMaster Deleted Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
        } catch (err) {
            console.log("Handler Error in delete ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in delete",
                message: `${err}`
            }, "Handler error in delete"))
        }
    }

}

export default Handler