import service from './service';
import { apiResponse, JsonWebToken } from "@adya/shared";
import { UserProfile } from '@adya/shared';

const newService = service.getInstance();
const user_profile_model = UserProfile.getInstance()

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


    async totalCount(req, res, next) {
        try {
            const { query, headers } = req
            const resp = await newService.total_Count()
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }
    async courseStatusCount(req, res, next) {
        try {
            const { query, headers } = req
            const resp = await newService.course_status_count()
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }
    async jobStatusCount(req, res, next) {
        try {
            const { query, headers } = req
            const resp = await newService.job_status_count()
            return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async listMyCourses(req, res, next) {
        try {
            const { query, headers } = req
            const decoded = await jwtInstance.verify((headers.authorization).split(" ")[1])
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            delete query?.page_no
            delete query?.per_page
            query.state = "Created"
            const sort = { "createdAt": -1 }
            console.log("Query for listMy Course---->", query, sort);

            const resp = await newService.courseList(query, page_no, per_page, sort)
            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
        } catch (err) {
            console.log("Handler Error ===========>>>> ", err)
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Handler Error",
                message: `${err}`
            }, "Handler error"))
        }
    }

    async getMyJoblist(req, res, next) {
        try {
            const { query, headers } = req;
            const decoded = await jwtInstance.verify(
                headers.authorization.split(' ')[1]
            );
            const page_no = parseInt(query?.page_no) || 1;
            const per_page = parseInt(query?.per_page) || 10;
            delete query?.page_no
            delete query?.per_page
            const sort = { "createdAt": -1 }

            const filterQuery: any = {
                // user_id: user_id,
                state: "Created"
            }

            const resp = await newService.getMyJoblist(filterQuery, page_no, per_page, sort);

            return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Job Data retrieved Successfully"))
        } catch (err) {
            console.log('Handler Error ===========>>>> ', err);
            return res.status(500).json(
                apiResponse.FAILURE_RESP(
                    {},
                    {
                        name: 'Handler Error',
                        message: `${err}`,
                    },
                    'Handler error'
                )
            );
        }
    }

}

export default Handler