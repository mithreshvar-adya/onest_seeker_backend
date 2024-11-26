import { GetClientFeedback, CreateUpdateDeleteSelectedFields } from './dto'
import { clientFeedback } from '@adya/shared';
import { global_env } from '@adya/shared';



const client_feedback = clientFeedback.getInstance();


class Service {
    private static instance: Service | null = null;

    // Private constructor to prevent direct instantiation
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() { }

    // Static method to get the singleton instance
    public static getInstance(): Service {
        if (this.instance === null) {
            this.instance = new Service();
        }
        return this.instance;
    }

    async get(query) {
        try {
            const select_fields = GetClientFeedback
            const resp = await client_feedback.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, select_fields)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async update(query, payload) {
        try {
            const select_fields = CreateUpdateDeleteSelectedFields
            await client_feedback.update(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, select_fields, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async create(payload) {
        try {
            await client_feedback.create(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async list(query, page_no, per_page, sort) {
        try {
            const select_fields = GetClientFeedback
            const response = await client_feedback.paginate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    // async delete(query) {
    //     try {

    //         let select_fields = createUpdateDeleteSelectedFields
    //         let resp = await client_feedback.delete()
    //         return resp
    //     }
    //     catch (err) {
    //         console.log("Service Error =====", err)
    //         throw err
    //     }
    // }



}

export default Service