import {  createUpdateDeleteSelectedFields,getUserServerSettings,getServerSettings } from './dto'
import { UserServerSettings} from '@adya/shared';
import { GlobalEnv } from '../../config/env';



const server_settings = UserServerSettings.getInstance();


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

    async getServerSettings(query) {
        try {

            const select_fields = getServerSettings
            const resp = await server_settings.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query,select_fields)
            
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async updateServerSettings(query, payload) {
        try {

            await server_settings.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async createServerSettings(payload) {
        try {
            console.log(payload)
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await server_settings.createUserServerSettings(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,select_fields, payload)
            return {id:resp}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async listServerSettings(query, page_no, per_page, sort) {
        try {
            const select_fields = getServerSettings
            const response = await server_settings.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)

            // let resp = await server_settings.readAllUsers(query, select_fields, sort)
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
    //         let resp = await server_settings.delete()
    //         return resp
    //     }
    //     catch (err) {
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }

    async getUserServerSettings(query) {
        try {

            const select_fields = getUserServerSettings
            const resp = await server_settings.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query,select_fields)
            
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async updateUserServerSettings(query, payload) {
        try {

            await server_settings.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async createUserServerSettings(payload) {
        try {
            console.log(payload)
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await server_settings.createUserServerSettings(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,select_fields, payload)
            return {id:resp}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async listUserServerSettings(query, page_no, per_page, sort) {
        try {
            const select_fields = getUserServerSettings
            const response = await server_settings.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)

            // let resp = await server_settings.readAllUsers(query, select_fields, sort)
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
    //         let resp = await server_settings.delete()
    //         return resp
    //     }
    //     catch (err) {
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }



}

export default Service