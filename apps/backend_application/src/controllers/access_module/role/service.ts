import { GlobalEnv } from '../../../config/env';
import { createUpdateDeleteSelectedFields, Get, GetAll, getrole } from './dto'
import { Role } from "@adya/shared";

const role_db = Role.getInstance()

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
    //         await role_db.upsert(DBNAMES.COMMON_POSTGRESS_URL, appConfig.COMMON_POSTGRESS_URL, {},{},payload)
    //         return {}
    //     }
    //     catch(err){
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }

    async findWithRole(query) {
        try {
            const filterQuery = query
            const select_fields = GetAll
            const resp = await role_db.findWithRole(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, filterQuery, select_fields)

            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async create(payload) {
        try {
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await role_db.create(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async get(query) {
        try {
            const select_fields = Get
            const resp = await role_db.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, select_fields)

            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async update(query, payload) {
        try {
            const select_fields = {
                id: true
            }
            const resp = await role_db.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, query, payload)
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
            const get_pagination = await role_db.get_pagination(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields)
            let skip_record = 0
            if (per_page != -1) {
                skip_record = (page_no - 1) * per_page
            }

            const respData = await role_db.getAll(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, query, skip_record, per_page, sort)

            const respDataJson = JSON.parse(JSON.stringify(respData)) as any[];

            // for (let i = 0; i < respDataJson.length; i++) {
            //   respDataJson[i].role_assign_module = respDataJson[i].role_assign_module || [];
            //   for (let j = 0; j < respDataJson[i].role_assign_module.length; j++) {

            //       let assign_module = respDataJson[i].role_assign_module[j];

            //       if (!assign_module.is_view && !assign_module.is_edit && !assign_module.is_delete) {
            //           console.log("Module to be removed:", assign_module.module_id, respDataJson[i].id);
            //           respDataJson[i].role_assign_module.splice(j, 1);
            //       }
            //   }
            // }

            // for (let i = 0; i < respDataJson.length; i++) {
            //     respDataJson[i]["module_counts"] = respDataJson[i].role_role_assign_module.length;
            //     respDataJson[i]["user_counts"] = respDataJson[i].role_user_in_role.length;
            //     delete respDataJson[i].role_user_in_role;
            // }

            const response = {
                data: respDataJson,
                pagination: get_pagination
            }
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    // async rolelist(query, page_no, per_page, sort) {
    //     try {
    //         let select_fields = getrole
    //         let get_pagination = await role_db.get_pagination(DBNAMES.COMMON_POSTGRESS_URL, appConfig.COMMON_POSTGRESS_URL, page_no, per_page, query)
    //         let skip_record = 0
    //         if (per_page != -1) {
    //             skip_record = (page_no - 1) * per_page
    //         }

    //         let respData = await role_db.getAll(DBNAMES.COMMON_POSTGRESS_URL, appConfig.COMMON_POSTGRESS_URL, select_fields, query, skip_record, per_page, sort)

    //         const respDataJson = JSON.parse(JSON.stringify(respData)) as any[];

    //         let response = {
    //             "data": respDataJson,
    //             "pagination": get_pagination
    //         }
    //         return response
    //     }
    //     catch (err) {
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }

    async delete(query) {
        try {
            // let role_query = { role_id: query.id }; 
            // await user_in_role_db.deleteAll(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME,role_query);
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await role_db.delete(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, select_fields, query)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

}

export default Service