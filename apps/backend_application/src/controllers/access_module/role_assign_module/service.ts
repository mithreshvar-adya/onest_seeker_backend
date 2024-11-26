import { RolePermission } from "@adya/shared";
import { createUpdateDeleteSelectedFields, Get, GetAll } from './dto'
import { GlobalEnv } from '../../../config/env';

const role_assign_module_db = RolePermission.getInstance()

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

    // async Upsert(payload){
    //     try{
    //         console.log(payload)
    //         await role_assign_module_db.upsert(DBNAMES.COMMON_POSTGRESS_URL, appConfig.COMMON_POSTGRESS_URL, {},{},payload)
    //         return {}
    //     }
    //     catch(err){
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }

    async create(payload) {
        try {
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await role_assign_module_db.createMany(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async get(query) {
        try {
            const select_fields = GetAll
            const resp = await role_assign_module_db.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, select_fields)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async update(query, payload) {
        try {
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await role_assign_module_db.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, query, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async list(query, page_no, per_page, sort) {
        try {
            const select_fields = GetAll
            const get_pagination = await role_assign_module_db.get_pagination(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query)
            let skip_record = 0
            if (per_page != -1) {
                skip_record = (page_no - 1) * per_page
            }

            const resp = await role_assign_module_db.getAll(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, query, skip_record, per_page, sort)
            const response = {
                data: resp,
                pagination: get_pagination
            }
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async delete(query) {
        try {
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await role_assign_module_db.delete(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, query)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

}

export default Service