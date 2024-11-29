import { GetUser, createUpdateDeleteSelectedFields, unwantedFields,AdminUserList } from './dto'
import { User,CourseOrder,Jobs } from '@adya/shared';
import { UserProfile } from '@adya/shared';
import { GlobalEnv } from '../../config/env';


// const test_db = AuthDbService.getInstance()
const user_model = User.getInstance();
const userProfile = UserProfile.getInstance();
const course_model = CourseOrder.getInstance();
const jobs_model = Jobs.getInstance();

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

            const select_fields = GetUser
            const resp = await user_model.readUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query,select_fields)
            
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async update(query, payload) {
        try {

            await user_model.updateUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async create(payload) {
        try {
            const resp = await user_model.createUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async createProfile(payload) {
        try {
            await userProfile.createProfile(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error in createProfile=====", err)
            throw err
        }

    }

    async list(query, page_no, per_page, sort) {
        try {
            const select_fields = GetUser
            const response = await user_model.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)

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
            const select_fields = createUpdateDeleteSelectedFields
            const resp = await user_model.deleteUser(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,query)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async getItem(query) {
        try {

            const select_fields = unwantedFields
            const data = await userProfile.findOneWithProjection(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, select_fields)
            return data
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async addItem(query, payload) {
        try {

            await userProfile.addItem(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)            
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async updateItem(query, payload) {
        try {
            const sequence = payload?.sequence
            delete payload?.sequence            
            await userProfile.updateItem(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload, sequence)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async deleteItem(query, payload) {
        try {

            await userProfile.deleteItem(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async updateUserProfile(query, payload) {
        try {

            await userProfile.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, payload)
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
            const response = await user_model.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort);
            
            // Wait for all user operations to complete
            const user_list = await Promise.all(
                response?.data.map(async user => {
                    const { ...restOfUserData } = user;
    
                    const total_course_enrolements = await course_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { state: "Created", user_id: user?.id });
                    const total_job_applications = await jobs_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { state: "Created", user_id: user?.id });
    
    
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