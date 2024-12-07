import { Jobs, JobCache } from '@adya/shared';
import { jobCacheDetail, jobDetail, adminJobListing } from './dto';
import { UserProfile } from '@adya/shared';
import { GlobalEnv } from '../../config/env';

const job_model = Jobs.getInstance();
const job_cache_model = JobCache.getInstance();
const user_profile_model = UserProfile.getInstance();

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

  async getSingleCacheJob(query) {
    try {
      const select_fields = jobCacheDetail;

      const user_id = query.user_id
      delete query?.user_id;


      const jobCache = await job_cache_model.findOneWithProjection(
        GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
        query,
        select_fields
      )

      const { saved_userIds, applied_userIds, ...finalresp } = jobCache;

      const processedJob = {
        ...finalresp,
        is_saved: saved_userIds?.includes(user_id) || false,
        is_applied: applied_userIds?.includes(user_id) || false
      };

      return processedJob;
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async getMyJob(query) {
    try {
      const select_fields = jobDetail;

      const job_id = query.job_id
      const user_id = query.user_id



      const jobModel = await job_model.findOneWithProjection(
        GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
        query,
        select_fields
      );
      if (jobModel == null) {
        return {}
      }

      delete query?.user_id;
      delete query?.state
      const jobCache = await job_cache_model.findOneWithProjection(
        GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
        query,
        select_fields
      )

      const { saved_userIds, applied_userIds } = jobCache;

      const processedJob = {
        ...jobModel,
        is_saved: saved_userIds?.includes(user_id) || false,
        is_applied: applied_userIds?.includes(user_id) || false
      };

      return processedJob;
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async create(payload) {
    try {
      await job_model.create(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, payload);
      return {};
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async getAllCacheJobs(query, page_no, per_page, sort) {
    try {
      const select_fields = jobCacheDetail;

      let user;
      if (query?.is_saved_job) {
        user = await user_profile_model.findOne(
          GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
          { user_id: query.user_id }
        )
        query['job_id'] = { $in: user?.saved_jobs };
      }

      delete query?.user_id;
      delete query?.is_saved_job;
      console.log("Query for list all cache jobs--->", query);

      const response = await job_cache_model.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
      return response;
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async saveJob(user_id: string, job_id: string, jobPayload: any) {
    try {
      await job_model.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { user_id, job_id }, jobPayload);
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async applyJob(user_id: string, job_id: string, jobPayload: any) {
    try {
      // Update job in the database
      await job_model.update(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { user_id, job_id }, jobPayload);
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async getMyJoblist(filterQuery, page_no, per_page, sort) {
    try {

      console.log('Filter Query: for my jobs', filterQuery);
      const select_fields = jobDetail
      const jobs = await job_model.paginate(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, filterQuery, select_fields, sort)
      return jobs;
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async find_user_Profile(filterQuery) {
    try {
      const user_id = filterQuery.user_id;
      const job_id = filterQuery.job_id;

      const user = await user_profile_model.findOne(
        GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
        { user_id: user_id }
      );

      const saved_jobs = user?.saved_jobs || []
      if (!saved_jobs.includes(job_id)) {
        saved_jobs.push(job_id)
      }

      const resp = await user_profile_model.update(
        GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
        { user_id: user_id }, { saved_jobs: saved_jobs }
      )

      return resp;

    } catch (err) {
      console.log('Service Error in find_user_Profile =====', err);
      throw err;
    }
  }

  async getAllJobListing(query, page_no, per_page, sort) {
    try {
      const select_fields = adminJobListing
      const response = await job_model.getAllJobListing(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
      return response
    }
    catch (err) {
      console.log("Service Error =====", err)
      throw err
    }
  }

  async getAllApplication(query, page_no, per_page, sort) {
    try {
      const select_fields = adminJobListing
      const response = await job_model.getAllApplication(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
      return response
    }
    catch (err) {
      console.log("Service Error =====", err)
      throw err
    }
  }

  async getAllJobProvider(query, page_no, per_page, sort) {
    try {
      const select_fields = adminJobListing
      const response = await job_model.getAllJobProvider(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, page_no, per_page, query, select_fields, sort)
      return response
    }
    catch (err) {
      console.log("Service Error =====", err)
      throw err
    }
  }

  async saveJobCache(payload) {
    try {
      const { user_id, job_id, type } = payload;
      const query = { job_id };
      let updateOperation;
      let updateMessage;
      if (type === 'save') {
        updateOperation = {
          $addToSet: { saved_userIds: user_id }
        };
        updateMessage = "Job saved successfully"
      } else if (type === 'unsave') {
        updateOperation = {
          $pull: { saved_userIds: user_id }
        };
        updateMessage = "Job unsaved successfully"
      } else {
        throw new Error('Invalid type provided. Must be "save" or "unsave".');
      }

      await job_cache_model.updateJob_Cache(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query, updateOperation);
      return updateMessage;
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }


  async getFilerData() {


    try {
      const [jobRoles, providerDescriptors] = await Promise.all([
        job_cache_model.getUniqueJobRoles(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME),
        job_cache_model.getUniqueProviderDescriptors(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME)
      ]);

      const jobFulfilmentTypes = [
        {
          "value": "HYBRID",
          "name": "Hybrid"
        },
        {
          "value": "REMOTE",
          "name": "Remote"
        },
        {
          "value": "ONSITE",
          "name": "Onsite"
        }
      ]

      // const employmentTypes = [
      //   {
      //     "value": "full-time",
      //     "name": "Full Time"
      //   },
      //   {
      //     "value": "part-time",
      //     "name": "Part Time"
      //   },
      //   {
      //     "value": "temporary",
      //     "name": "Temporary"
      //   },
      //   {
      //     "value": "contract",
      //     "name": "Contract"
      //   },
      //   {
      //     "value": "consultant",
      //     "name": "Consultant"
      //   }
      // ]

      const employmentTypes = [
        {
          "value": "Full Time",
          "name": "Full Time"
        },
        {
          "value": "Part Time",
          "name": "Part Time"
        },
        {
          "value": "Temporary",
          "name": "Temporary"
        },
        {
          "value": "Contract",
          "name": "Contract"
        },
        {
          "value": "Consultant",
          "name": "Consultant"
        }
      ]

      const response = [
        {
          key: "job_fulfilment_type",
          title: "Job Fulfilment Type",
          data: jobFulfilmentTypes.map(item => ({
            value: item.value,
            name: item.name || ""
          }))
        },
        {
          key: "job_role",
          title: "Job Role",
          data: jobRoles.map(item => ({
            value: item._id,
            name: item._id || ""
          }))
        },
        {
          key: "employment_type",
          title: "Employment Type",
          data: employmentTypes.map(item => ({
            value: item.value,
            name: item.name || ""
          }))
        },
        {
          key: "provider_descriptor",
          title: "Provider Descriptor",
          data: providerDescriptors.map(item => ({
            value: item.providerId,
            name: item.providerDescriptor.name || ""
          }))
        }
      ]


      return response;

    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }



}

export default Service;
