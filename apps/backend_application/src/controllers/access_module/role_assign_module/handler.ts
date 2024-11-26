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

    async create(req, res) {
        try {
            const { body, headers } = req
            const decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
            console.log("decoded: ", decoded);

            const resp = [];
            // for(var i = 0; i< body.length; i ++)
            // {
            //     body[i].company_id = decoded?.company_id
            resp.push(await newService.create(body))
            // }   
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "RoleAssignModule Created Successfully"))
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
            const { params } = req;
            const getRoleAssignModule = await newService.get({ id: params?.id })
            if (getRoleAssignModule) {
                return res.status(200).json(apiResponse.SUCCESS_RESP(getRoleAssignModule, "RoleAssignModule Retrieved Successfully"))
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

    // async update(req, res) {
    //     try {
    //         let { body, params, headers } = req
    //         let decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);
    //         var resp = [];

    //         for (var i = 0; i < body.length; i++) {
    //             body[i].company_id = decoded?.company_id    
    //             const compositeKeyFilter = {role_id_module_id:{role_id: body[i]?.role_id, module_id: body[i]?.module_id}};
    //             const updateFields = {
    //                 is_view: body[i]?.is_view,
    //                 is_edit: body[i]?.is_edit,
    //                 is_delete: body[i]?.is_delete
    //             };

    //             var existingRecordFilter = { role_id: body[i]?.role_id, module_id: body[i]?.module_id };
    //             var existingRecords = await newService.get(existingRecordFilter);

    //             if (existingRecords?.data.length > 0) {
    //                 resp.push(await newService.update(compositeKeyFilter, updateFields));
    //             } else {
    //                 resp.push(await newService.create([body[i]]));
    //             }
    //         }
    //         return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "RoleAssignModule Updated Successfully"))
    //     } catch (err) {
    //         console.log("Handler Error in update ===========>>>> ", err)
    //         return res.status(500).json(apiResponse.FAILURE_RESP({}, {
    //             name: "Handler Error in update",
    //             message: `${err}`
    //         }, "Handler error in update"))
    //     }
    // }

    async update(req, res) {
        try {
            const { body, headers } = req;

            const decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);

            const companyId = decoded?.company_id;
            const resp = [];

            for (const item of body) {
                console.log("item: ", item);

                item.company_id = companyId;

                const updateFields = {
                    is_view: item?.is_view,
                    is_edit: item?.is_edit,
                    is_delete: item?.is_delete
                };

                const compositeKeyFilter = {
                    role_id_module_id: {
                        role_id: item?.role_id,
                        module_id: item?.module_id
                    }
                };

                const existingRecordFilter = { role_id: item?.role_id, module_id: item?.module_id };
                console.log("existingRecordFilter: ", existingRecordFilter);

                const existingRecords = await newService.get(existingRecordFilter)

                console.log("existingRecords: ", existingRecords);

                if (existingRecords != null) {
                    console.log("update....");
                    resp.push(await newService.update(existingRecords, updateFields))
                } else {
                    console.log("create....");
                    resp.push(await newService.create([item]))
                }
            }

            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "RoleAssignModule Updated Successfully"));
        } catch (err) {
            console.error("Handler Error in update ===========>>>> ", err);
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in update",
                message: `${err}`
            }, "Handler error in update"));
        }
    }

    async list(req, res) {
        try {
            const { query } = req

            const filterQuery = {};

            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            const sort = [
                { "createdAt": -1 },
                { "updatedAt": -1 },
            ]

            const resp = await newService.list(filterQuery, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "RoleAssignModules Retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error in list ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error in list",
                message: `${err}`
            }, "Handler error in list"))
        }
    }

    async delete(req, res) {
        try {
            const { params } = req
            const Delete = await newService.delete({ id: params?.id })
            // let getRoleAssignModule = await newService.get({ id: params?.id })
            // if (getRoleAssignModule) {
            //     let query = {
            //         id: getRoleAssignModule?.id
            //     }
            //     let Delete = await newService.delete(query) //{ id: params?.id }
            //     return res.status(200).json(apiResponse.SUCCESS_RESP(Delete, "RoleAssignModule Deleted Successfully"))
            // } else {
            //     return res.status(500).json(apiResponse.FAILURE_RESP({}, {
            //         name: "Record Not Found Error",
            //         message: `Record Not Found`
            //     }, "Record Not Found"))
            // }
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