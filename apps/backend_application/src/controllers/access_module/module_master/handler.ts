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

    private handleError(res, err, context) {
        console.log(`Handler Error in ${context} ===========>>>> `, err);
        return res.status(500).json(apiResponse.FAILURE_RESP({}, {
            name: `Handler Error in ${context}`,
            message: `${err}`
        }, `Handler error in ${context}`));
    }

    async create(req, res) {
        try {
            const { body } = req;
            const resp = await newService.create(body);
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "ModuleMaster Created Successfully"));
        } catch (err) {
            return this.handleError(res, err, "create");
        }
    }

    async get(req, res) {
        const { params } = req;
        try {
            const getModuleMaster = await newService.get({ id: params?.id })
            if (getModuleMaster) {
                return res.status(200).json(apiResponse.SUCCESS_RESP(getModuleMaster, "ModuleMaster Retrieved Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
        } catch (err) {
            return this.handleError(res, err, "get");
        }
    }

    async list(req, res) {
        const { query, headers } = req;
        try {
            const decoded = await jwtInstance.verify(headers.authorization.split(" ")[1]);

            console.log(decoded);

            const filterQuery = {
                created_by_id: decoded?.id
            }

            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            const sort = [
                { "createdAt": 'desc' },
                { "updatedAt": 'desc' },
            ]

            const resp = await newService.list(filterQuery, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "ModuleMasters Retrieved Successfully"))
        } catch (err) {
            return this.handleError(res, err, "list");
        }
    }

    async update(req, res) {
        const { body, params } = req;
        try {
            const getModuleMaster = await newService.get({ id: params?.id });
            if (getModuleMaster) {
                const query = {
                    id: getModuleMaster?.id
                }
                const response = await newService.update(query, body)
                return res.status(200).json(apiResponse.SUCCESS_RESP(response, "ModuleMaster Updated Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
        } catch (err) {
            return this.handleError(res, err, "update");
        }
    }

    async delete(req, res) {
        const { params } = req;
        try {
            const getModuleMaster = await newService.get({ id: params?.id });
            if (getModuleMaster) {
                const query = {
                    id: getModuleMaster?.id
                }
                const Delete = await newService.delete(query)
                return res.status(200).json(apiResponse.SUCCESS_RESP(Delete, "ModuleMaster Deleted Successfully"))
            } else {
                return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                    name: "Record Not Found Error",
                    message: `Record Not Found`
                }, "Record Not Found"))
            }
        } catch (err) {
            return this.handleError(res, err, "delete");
        }
    }

}

export default Handler;