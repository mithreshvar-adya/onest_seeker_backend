import { CourseOrder, CourseCache, OnActions, UserProfile, Jobs } from '@adya/shared';
import { unwantedFields, CourseDetail, CourseOrderDetail, orderWantedFields, cacheWantedFields, getForAdmin, jobDetail } from './dto';
import { GlobalEnv } from '../../config/env';

const course_model = CourseOrder.getInstance();
const course_cache_model = CourseCache.getInstance();
const action_model = OnActions.getInstance()
const user_profile_model = UserProfile.getInstance()
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


    async total_Count() {
        try {


            const total_course_enrolements = await course_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { state: "Created" })
            const total_job_applications = await jobs_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { state: "Created" })

            return {
                total_course_enrolements: total_course_enrolements,
                total_job_applications: total_job_applications
            }
        } catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async course_status_count() {
        try {


            const total_not_started_courses = await course_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "NOT-STARTED" })
            const total_in_progress_courses = await course_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "IN-PROGRESS" })
            const total_completed_courses = await course_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "COMPLETED" })

            return {
                total_not_started_courses: total_not_started_courses,
                total_in_progress_courses: total_in_progress_courses,
                total_completed_courses: total_completed_courses

            }
        } catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async job_status_count() {
        try {


            const total_application_submitted_jobs = await jobs_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "APPLICATION-SUBMITTED" })
            const total_application_rejected_jobs = await jobs_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "APPLICATION-REJECTED" })
            const total_assement_in_progress_jobs = await jobs_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "ASSESSMENT-IN-PROGRESS" })
            const total_offer_extended_jobs = await jobs_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "OFFER-EXTENDED" })
            const total_application_in_progress_jobs = await jobs_model.total_count(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { "fulfillment_status.code": "APPLICATION-IN-PROGRESS" })


            return {
                total_application_submitted_jobs: total_application_submitted_jobs,
                total_application_rejected_jobs: total_application_rejected_jobs,
                total_assement_in_progress_jobs: total_assement_in_progress_jobs,
                total_offer_extended_jobs: total_offer_extended_jobs,
                total_application_in_progress_jobs: total_application_in_progress_jobs
            }
        } catch (err) {
            console.log("Service Error =====", err)
            throw err
        }

    }

    async courseList(query, page_no, per_page, sort) {
        try {
            const select_fields = orderWantedFields
            const response = await course_model.List(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
            return response
        }
        catch (err) {
            console.log("Service Error =====", err)
            throw err
        }
    }

    async getMyJoblist(filterQuery, page_no, per_page, sort) {
        try {

            console.log('Filter Query: for my jobs', filterQuery);
            const select_fields = jobDetail
            const jobs = await jobs_model.List(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, filterQuery, select_fields, sort)
            return jobs;
        } catch (err) {
            console.log('Service Error =====', err);
            throw err;
        }
    }

}

export default Service