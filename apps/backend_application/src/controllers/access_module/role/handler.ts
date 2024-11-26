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

    async findWithRole(req, res) {
        try {
            const { params } = req
            const getRole = await newService.findWithRole({ id: params?.id })
            if (getRole) {
                return res.status(200).json(apiResponse.SUCCESS_RESP(getRole, "Role Retrieved Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
        } catch (err) {
            console.log("Handler Error in findWithRole ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in findWithRole",
                message: `${err}`
            }, "Handler error in findWithRole"))
        }
    }

    async create(req, res) {
        try {
            const { body, headers } = req
            const decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
            body.company_id = decoded?.company_id;
            body.created_by_id = decoded?.id;
            console.log("company_id: ", body.company_id);


            const getRole = await newService.get({ name: body?.name })
            if (getRole) {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Role Already Exists",
                    message: `Role Already Exists`
                }, "Record Already Exists"))
            } else {
                const resp = await newService.create(body)
                return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Role Created Successfully"))
            }
        } catch (err) {
            console.log("Handler Error in create ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in create",
                message: `${err}`
            }, "Handler error in create"))
        }
    }

    async get(req, res) {
        try {
            const { params } = req
            const getRole = await newService.get({ id: params?.id })
            if (getRole) {
                return res.status(200).json(apiResponse.SUCCESS_RESP(getRole, "Role Retrieved Successfully"))
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

    async update(req, res) {
        try {
            const { body, params } = req
            const getRole = await newService.get({ id: params?.id })
            if (getRole) {
                const query = {
                    id: getRole?.id
                }
                const response = await newService.update(query, body)
                return res.status(200).json(apiResponse.SUCCESS_RESP(response, "Role Updated Successfully"))
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

    async list(req, res) {
        try {
            const { query } = req

            const filterQuery: any = {};

            if (query?.search) {
                filterQuery["$or"] = [
                    {
                        "name": {
                            $regex: query?.search,
                            $options: 'i'
                        }
                    },
                ]
            }

            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            const sort = [
                { "createdAt": -1 },
                { "updatedAt": -1 },
            ]

            const resp = await newService.list(filterQuery, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Roles Retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error in list ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in list",
                message: `${err}`
            }, "Handler error in list"))
        }
    }

    // async rolelist(req, res) {
    //     try {
    //         let { query,headers } = req
    //         let decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
    //         let filterQuery: any = {};

    //         let roles = {
    //             "SUPER_ADMIN": ["JOB_ADMIN", "INSTRUCTOR_ADMIN", "INSTRUCTOR", "EMPLOYER"],
    //             "JOB_ADMIN": ["EMPLOYER"],
    //             "SCHOLARSHIP_ADMIN": ["SCHOLARSHIP"],
    //             "INSTRUCTOR_ADMIN": ["INSTRUCTOR"],
    //             "INSTRUCTOR": [],
    //             "EMPLOYER": [],
    //             "SCHOLARSHIP": []
    //         }

    //         let user_role = roles[decoded?.roles?.[0]] || []

    //         if (decoded?.roles?.[0] === "SUPER_ADMIN") {
    //             filterQuery = {
    //                 name: {  
    //                     notIn: ["SCHOLARSHIP", "SCHOLARSHIP_ADMIN"]      
    //                 }
    //             };
    //         } else {
    //             filterQuery = {
    //                 name: {
    //                     in: user_role
    //                 }
    //             };
    //         }
    //         if (query?.search) {
    //             filterQuery["OR"] = [
    //                 {
    //                     "name": {
    //                         contains: query?.search,
    //                         "mode": 'insensitive'
    //                     }
    //                 },           
    //             ]
    //         }

    //         let page_no = parseInt(query?.page_no) || 1;
    //         let per_page = parseInt(query?.per_page) || 10;
    //         let sort = [
    //             { "createdAt": 'desc' },
    //             { "updatedAt": 'desc' },
    //         ]


    //         let resp = await newService.rolelist(filterQuery, page_no, per_page, sort)
    //         return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Roles Retrieved Successfully"))
    //     } catch (err) {
    //         console.log("Handler Error ===========>>>> ", err)
    //         return res.status(500).json(apiResponse.FAILURE_RESP({}, {
    //             name: "Handler Error",
    //             message: `${err}`
    //         }, "Handler error"))
    //     }
    // }

    async delete(req, res) {
        try {
            const { params } = req
            const getRole = await newService.get({ id: params?.id })
            if (getRole) {
                const query = {
                    id: getRole?.id
                }
                const Delete = await newService.delete(query)
                return res.status(200).json(apiResponse.SUCCESS_RESP(Delete, "Role Deleted Successfully"))
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