import { GetNotificationHistory, createUpdateDeleteSelectedFields } from './dto'
import { NotificationHistory} from '@adya/shared';
import { GlobalEnv } from '../../config/env';



const notificationHistory = NotificationHistory.getInstance();


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

            const select_fields = GetNotificationHistory
            const resp = await notificationHistory.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query,select_fields)

            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async update(query, payload) {
        try {

            await notificationHistory.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async create(payload) {
        try {
            await notificationHistory.createNotificationHistory(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async list(query, page_no, per_page, sort) {
        try {
            const select_fields = GetNotificationHistory
            const response = await notificationHistory.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)

            // let resp = await notificationHistory.readAllUsers(query, select_fields, sort)
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
    //         let resp = await notificationHistory.delete()
    //         return resp
    //     }
    //     catch (err) {
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }



}

export default Service