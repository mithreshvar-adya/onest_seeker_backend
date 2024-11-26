import { ModuleMastetr, global_env } from "@adya/shared";
import { createUpdateDeleteSelectedFields, Get,GetAll } from './dto'

const module_master_db = ModuleMastetr.getInstance()

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

    // async Upsert(payload){
    //     try{
    //         console.log(payload)
    //         await module_master_db.upsert(DBNAMES.COMMON_POSTGRESS_URL, appConfig.COMMON_POSTGRESS_URL, {},{},payload)
    //         return {}
    //     }
    //     catch(err){
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }

    async create(payload) {
        try {
            let select_fields = createUpdateDeleteSelectedFields
            let resp = await module_master_db.create(
              global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, select_fields, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async get(query) {
        try {
            let select_fields = Get
            let resp = await module_master_db.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, select_fields)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async update(query, payload) {
        try {
            let select_fields = {
                id: true
            }
            let resp = await module_master_db.update(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, select_fields, query, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async list(query, page_no, per_page, sort) {
        try {
            let select_fields = GetAll
            let get_pagination = await module_master_db.get_pagination(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query)
            let skip_record = 0
            if (per_page != -1) {
                skip_record = (page_no - 1) * per_page
            }

            let resp = await module_master_db.getAll(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, select_fields, query, skip_record, per_page, sort)
            let response = {
                "data": resp,
                "pagination": get_pagination
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
            let select_fields = createUpdateDeleteSelectedFields
            let resp = await module_master_db.delete(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, select_fields, query)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

}

export default Service