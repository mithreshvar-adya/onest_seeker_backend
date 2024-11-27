import { CourseOrder, CourseCache, OnActions, UserProfile } from '@adya/shared';
import { unwantedFields, CourseDetail, CourseOrderDetail, orderWantedFields, cacheWantedFields, getForAdmin, CertificateDetails } from './dto';
import { global_env } from "@adya/shared";

const course_model = CourseOrder.getInstance();
const course_cache_model = CourseCache.getInstance();
const action_model = OnActions.getInstance()
const user_profile_model = UserProfile.getInstance()

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

    async getCourseDetail(query){
        try {
            const user_id = query.user_id;
            const course_id = query.course_id;

            let user = await user_profile_model.findOne(
                global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, 
                {user_id: user_id})

            user.recent_viewed_course = user.recent_viewed_course || [];

            const existingIndex = user.recent_viewed_course.indexOf(course_id);
            if (existingIndex > -1) {
                user.recent_viewed_course.splice(existingIndex, 1);
            }
            
            // console.log("current: ", user.recent_viewed_course);
            user.recent_viewed_course.push(course_id);
    
            if (user.recent_viewed_course.length > 10) {
                user.recent_viewed_course.shift(); 
            }
    
            await user_profile_model.updateProfile(
                global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME,
                { user_id: user_id },
                { recent_viewed_course: user.recent_viewed_course }
            );
            // console.log("updated: ",user.recent_viewed_course); 

            let select_fields = cacheWantedFields
            let resp = await course_cache_model.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, {course_id: course_id}, select_fields)            
            let enrolled_check = false
            
            let orderData = await course_model.findOne(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, { "items.course_id": course_id, user_id: user_id })
            
            if (orderData?.["state"] == "Created") {
                enrolled_check = true
            }
            const{saved_userIds}=resp
            console.log("saved_userIds",saved_userIds);
            console.log("user_id",user_id);
            

            
            resp.is_enrolled = enrolled_check
            resp.is_saved= saved_userIds?.includes(user_id) || false
            return resp     
        }
        catch (err) {
            console.log("Service Error in getCourseDetail function =====", err)
            throw err
        }
    }

    async getCache(query) {
        try {

            let select_fields = cacheWantedFields
            let resp = await course_cache_model.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query,select_fields)            
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async get(query) {
        try {
    
            let select_fields = CourseOrderDetail
            let resp = await course_model.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query,select_fields)

            console.log('query?.items?.course_id',resp?.items?.course_id);
            
            let cache_select_fields = cacheWantedFields
            let cache_resp = await course_cache_model.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, {course_id: resp?.items?.course_id}, cache_select_fields)
            const{saved_userIds}=cache_resp
            console.log("saved_userIds",saved_userIds);
            console.log("user_id",query?.user_id);

            resp.is_saved= saved_userIds?.includes(query?.user_id) || false

            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    
    }

    async update(query, payload) {
        try {

           let resp =await course_model.update(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }
    async create(payload) {
        try {
            await action_model.createOnAction(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME,payload)
            return {}
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async list(query, page_no, per_page, sort) {
        try {
            let select_fields = orderWantedFields
            let response = await course_model.paginate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)        
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    // async listCacheCourses(query, page_no, per_page, sort) {
    //     try {
    //         let select_fields = cacheWantedFields
    //         let response = await course_cache_model.paginate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
    //         return response
    //     }
    //     catch (err) {
    //         console.log("Service Error =====", err)
    //         throw err
    //     }

    // }

    async listCacheCourses(query, page_no, per_page, sort) {
        try {
            let select_fields = cacheWantedFields
            let user_id = query?.user_id
            delete query?.user_id;

            let response = await course_cache_model.paginate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
           
            let courses = response?.data.map(course => {
                const {saved_userIds, purchased_userIds, ...restOfCourse } = course;

                return {
                    ...restOfCourse,
                    is_enrolled: user_id && Array.isArray(purchased_userIds) 
                                ? purchased_userIds.includes(user_id) 
                                : false,
                    is_saved: user_id && Array.isArray(saved_userIds)
                    ? saved_userIds.includes(user_id)
                    : false
                };
            });
          
            return {
                ...response,
                data: courses
            };
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }
    

    async cacheCourses(query, page_no, per_page, sort) {
        try {
            let select_fields = cacheWantedFields
            let user_id = query?.user_id
            delete query?.user_id;

            let resp = await course_cache_model.landPagelist(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
    
            let courses = resp.map(course => {
                const { saved_userIds,purchased_userIds, ...restOfCourse } = course;
    
                return {
                    ...restOfCourse,
                    is_enrolled: user_id && Array.isArray(purchased_userIds)
                        ? purchased_userIds.includes(user_id)
                        : false,
                    is_saved: user_id && Array.isArray(saved_userIds)
                    ? saved_userIds.includes(user_id)
                    : false
                };
            });
    
            resp = courses;
    
            return resp;
            
        }catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async CourseDetail(query) {
        try {
    
            let select_fields = CourseDetail
            let resp = await course_model.findOneWithProjection(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query,select_fields)
            return resp
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    
    }

    
    async getFilterDetail() {
        try {
            const [ categories,  providerDescriptors] = await Promise.all([
                course_cache_model.getUniqueCategoryIds(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME),
                course_cache_model.getUniqueProviderDescriptors(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME)
          ]);
          
          const learner_level = [
            {
                value: "Beginner",
                name: "Beginner"
            },
            {
                value: "Intermediate",
                name: "Intermediate"
            },
            {
                value: "Advanced",
                name: "Advanced"
            }   
        ]

          const response =  [
            {
                key: "topics",
                title: "Course Category",
                data: categories.map(item => ({
                    value: item._id,
                    name: item._id|| ""
                }))
            },
            {
                key: "learner_level",
                title: "Learner Level",
                data: learner_level.map(item => ({
                    value: item.value,
                    name: item.name || ""
                }))
            },
            {
                key: "providers",
                title: "Provider Descriptor",
                data: providerDescriptors.map(item => ({
                    // value: item.providerId,
                    value: item.providerDescriptor.name,
                    name: item.providerDescriptor.name || ""
                }))
            }
        ]
   

    return response;
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }




    async adminlistAllCourses(query, page_no, per_page, sort) {
        try {
            let select_fields = getForAdmin
            let response = await course_model.listAll(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)        
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async getAllCertificate(query, page_no, per_page, sort){
        try {
            let select_fields = getForAdmin
            let response = await course_model.getAllCertificate(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)        
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async getOnAction(query){
        try {
            let response = await action_model.findAll(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query)
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async saveCourseCache(payload) {
        try {
          const { user_id, course_id, type } = payload;
          const query = { course_id };
          let updateOperation;
          let updateMessage;
          if (type === 'save') {
            updateOperation = {
              $addToSet: { saved_userIds: user_id }
            };
            updateMessage = "Course saved successfully"
          } else if (type === 'unsave') {
            updateOperation = {
              $pull: { saved_userIds: user_id }         
            };
            updateMessage = "Course unsaved successfully"
          } else {
            throw new Error('Invalid type provided. Must be "save" or "unsave".');
          }
      
          await course_cache_model.updateCourseCache(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, updateOperation);
          return updateMessage;
        } catch (err) {
          console.log('Service Error =====', err);
          throw err;
        }
      }
}

export default Service