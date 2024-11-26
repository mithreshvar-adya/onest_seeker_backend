import { GetUser, createUpdateDeleteSelectedFields, unwantedFields,AdminUserList } from './dto'
import { User,CourseOrder,Jobs } from '@adya/shared';
import { UserProfile } from '@adya/shared';
import { global_env } from '@adya/shared';


// const test_db = AuthDbService.getInstance()
const user_model = User.getInstance();
const userProfile = UserProfile.getInstance();
const course_model = CourseOrder.getInstance();
const jobs_model = Jobs.getInstance();

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

            let select_fields = GetUser
            let resp = await user_model.readUser(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query,select_fields)
            
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async update(query, payload) {
        try {

            await user_model.updateUser(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async create(payload) {
        try {
            let resp = await user_model.createUser(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async createProfile(payload) {
        try {
            await userProfile.createProfile(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error in createProfile=====", err)
            throw err
        }

    }

    async list(query, page_no, per_page, sort) {
        try {
            let select_fields = GetUser
            let response = await user_model.paginate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)

            // let resp = await user_model.readAllUsers(query, select_fields, sort)
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

    async delete(query) {
        try {
            let select_fields = createUpdateDeleteSelectedFields
            let resp = await user_model.deleteUser(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME,query)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async getItem(query) {
        try {

            let select_fields = unwantedFields
            let data = await userProfile.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, select_fields)
            return data
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async addItem(query, payload) {
        try {

            await userProfile.addItem(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload)            
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async updateItem(query, payload) {
        try {
            let sequence = payload?.sequence
            delete payload?.sequence            
            await userProfile.updateItem(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload, sequence)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async deleteItem(query, payload) {
        try {

            await userProfile.deleteItem(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async updateUserProfile(query, payload) {
        try {

            await userProfile.update(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async  adminUserList(query, page_no, per_page, sort) {
        try {
            const select_fields = AdminUserList;
            const response = await user_model.paginate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort);
            
            // Wait for all user operations to complete
            const user_list = await Promise.all(
                response?.data.map(async user => {
                    const { ...restOfUserData } = user;
    
                    const total_course_enrolements = await course_model.total_count(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, { state: "Created", user_id: user?.id });
                    const total_job_applications = await jobs_model.total_count(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, { state: "Created", user_id: user?.id });
    
    
                    return {
                        ...restOfUserData,
                        course_count: total_course_enrolements,
                        job_count: total_job_applications
                    };
                })
            );
    
    
            return {
                ...response,
                data: user_list
            };
        } catch (err) {
            console.log("Service Error =====", err);
            throw err;
        }
    }

}

export default Service