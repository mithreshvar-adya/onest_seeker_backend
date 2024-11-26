import { GetClientFeedback, createUpdateDeleteSelectedFields } from './dto'
import { clientFeedback} from '@adya/shared';
import { global_env } from '@adya/shared';



const client_feedback = clientFeedback.getInstance();


class Service {
    private static instance: Service | null = null;

    // Private constructor to prevent direct instantiation
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

            let select_fields = GetClientFeedback
            let resp = await client_feedback.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query,select_fields)
            
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async update(query, payload) {
        try {
            let select_fields = createUpdateDeleteSelectedFields
            await client_feedback.update(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, select_fields,payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async create(payload) {
        try {
            let select_fields = createUpdateDeleteSelectedFields
            console.log(payload)
            const resp = await client_feedback.create(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME,payload)
            return {id:resp}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async list(query, page_no, per_page, sort) {
        try {
            let select_fields = GetClientFeedback
            let response = await client_feedback.paginate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)

            // let resp = await client_feedback.readAllUsers(query, select_fields, sort)
            // let response = {
            //     "data": resp,
            //     "pagination": get_pagination
            // }
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