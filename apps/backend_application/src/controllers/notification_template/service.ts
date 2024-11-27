import { GetNotificationTemplate, createUpdateDeleteSelectedFields } from './dto'
import { NotificationTemplate} from '@adya/shared';
import { GlobalEnv } from '../../config/env';



const notificationTemplate = NotificationTemplate.getInstance();


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

            const select_fields = GetNotificationTemplate
            const resp = await notificationTemplate.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query,select_fields)
            
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async update(query, payload) {
        try {

            await notificationTemplate.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async create(payload) {
        try {
            console.log(payload)
            const resp = await notificationTemplate.createNotificationTemplate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, payload)
            return {id:resp}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async list(query, page_no, per_page, sort) {
        try {
            const select_fields = GetNotificationTemplate
            const response = await notificationTemplate.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)

            // let resp = await notificationTemplate.readAllUsers(query, select_fields, sort)
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

    //         const select_fields = createUpdateDeleteSelectedFields
    //         const resp = await notificationTemplate.delete()
    //         return resp
    //     }
    //     catch (err) {
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }



}

export default Service