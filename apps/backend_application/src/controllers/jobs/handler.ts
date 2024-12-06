import service from './service';
import { apiResponse, JsonWebToken, JobCache, Jobs, UserProfile } from '@adya/shared'; // Assuming JobCache and Jobs are properly exported
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for decoding JWTs
import { GlobalEnv } from '../../config/env';

const newService = service.getInstance();
const jobCacheModel = JobCache.getInstance();
const jobModel = Jobs.getInstance();
const user_profile_model = UserProfile.getInstance()
const jwtInstance = new JsonWebToken();

class Handler {
  private static instance: Handler | null = null;

  // Private constructor to prevent direct instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  // Static method to get the singleton instance
  public static getInstance(): Handler {
    if (this.instance === null) {
      this.instance = new Handler();
    }
    return this.instance;
  }

  async createCacheJob(req, res, next) {
    try {
      const { body } = req;
      await jobCacheModel.createCacheJob(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, body);
      return res
        .status(200)
        .json(
          apiResponse.SUCCESS_RESP({}, 'Job Description Created Successfully')
        );
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async getCacheJobs(req, res, next) {
    try {
      const { params } = req;
      const resp = await jobCacheModel.getCacheJobs(
        GlobalEnv.MONGO_DB_URL,
        GlobalEnv.MONGO_DB_NAME,
        { id: params?.id }
      );
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async listJobs(req, res, next) {
    try {
      const { query } = req;
      const page_no = parseInt(query?.page_no) || 1;
      const per_page = parseInt(query?.per_page) || 10;
      delete query?.page_no
      delete query?.per_page
      const sort = {};
      const { job_name } = query
      if (job_name) {
        query['job_descriptor.name'] = {
          $regex: job_name,
          $options: 'i',
        };
        delete query.job_name
      }
      const resp = await newService.getAllCacheJobs(query, page_no, per_page, sort)
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Job Data retrieved Successfully"))
    } catch (err) {
      console.log('Handler Error listJobs ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }


  async getACacheJobDetail(req, res, next) {
    try {
      const { body, params, headers } = req;
      const decoded = await jwtInstance.verify(headers.authorization.split(' ')[1]);
      const user_id = decoded.id

      const resp = await newService.getSingleCacheJob({
        job_id: params?.id,
        user_id: user_id
      });

      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(apiResponse.FAILURE_RESP({},
        {
          name: 'Handler Error', message: `${err}`,
        }, 'Handler error'
      )
      );
    }
  }

  async getAllCacheJobs(req, res, next) {
    try {
      const { query, headers } = req;
      const { job_name, job_role, employment_type, job_fulfilment_type, min_salary, max_salary, is_saved_job, provider_descriptor } = query;

      const decoded = await jwtInstance.verify(headers.authorization.split(' ')[1]);
      const user_id = decoded.id
      const filterQuery = {};

      if (job_name) {
        filterQuery['job_descriptor.name'] = {
          $regex: job_name,
          $options: 'i',
        };
      }

      if (is_saved_job) {
        filterQuery['saved_userIds'] = { $in: [user_id] };
      }

      if (job_role || employment_type) {
        filterQuery['content_metadata.listing_details.list'] = {
          $all: [
            job_role ? {
              $elemMatch: {
                'descriptor.code': 'job-role',
                'value': { $in: job_role.split(',').map(v => v.trim()) }
              }
            } : null,
            employment_type ? {
              $elemMatch: {
                'descriptor.code': 'employment-type',
                'value': { $in: employment_type.split(',').map(v => v.trim()) }
              }
            } : null
          ].filter(Boolean)
        };
      }

      if (job_fulfilment_type) {
        filterQuery['fulfillments.type'] = { $in: job_fulfilment_type.split(',').map(v => v.trim()) };
      }

      if (min_salary || max_salary) {
        filterQuery['content_metadata.salary_info.list'] = {
          $all: [
            min_salary ? {
              $elemMatch: {
                'descriptor.code': 'gross-min',
                'value': { $gte: min_salary }
              }
            } : null,
            max_salary ? {
              $elemMatch: {
                'descriptor.code': 'gross-max',
                'value': { $lte: max_salary }
              }
            } : null
          ].filter(Boolean)
        };
      }
      if (provider_descriptor) {
        filterQuery['provider_id'] = { $in: provider_descriptor.split(',').map(v => v.trim()) };
      }

      const page_no = parseInt(query.page_no as string) || 1;
      const per_page = parseInt(query.per_page as string) || 10;
      const sort = {};

      const resp = await newService.getAllCacheJobs(
        filterQuery,
        page_no,
        per_page,
        sort
      );

      const jobs = resp?.data.map(job => {
        const { saved_userIds, applied_userIds, ...restOfJob } = job;
        return {
          ...restOfJob,
          is_saved: saved_userIds?.includes(decoded?.id) || false,
          is_applied: applied_userIds?.includes(decoded?.id) || false
        };
      });

      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, jobs, "Job Data retrieved Successfully"))
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async getFilterData(req, res, next) {
    try {
      const resp = await newService.getFilerData();
      console.log(resp);
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }


  async postJob(req, res, next) {
    try {
      const { body } = req;
      await newService.create(body);
      return res
        .status(200)
        .json(
          apiResponse.SUCCESS_RESP({}, 'Job Description Created Successfully')
        );
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async saveJob(req, res, next) {
    try {
      const { headers, query } = req;

      const decoded = await jwtInstance.verify(
        headers.authorization.split(' ')[1]
      );

      const user_id = decoded.id;
      const job_id = query.job_id;
      const type = query.type;

      const resp = await newService.saveJobCache({ user_id: user_id, job_id: job_id, type: type })


      return res
        .status(200)
        .json(apiResponse.SUCCESS_RESP({}, resp));

    } catch (err) {
      console.log('Handler Error in saveJob ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error in saveJob',
            message: `${err}`,
          },
          'Handler error in saveJob'
        )
      );
    }
  }

  async applyJob(req, res, next) {
    try {
      const { body, headers } = req;
      const { job_id } = body; // Extract job_id and user_id from request body

      const decoded = await jwtInstance.verify(
        headers.authorization.split(' ')[1]
      );
      const user_id = decoded.id;

      // if (!user_id) {
      //   return res.status(401).json(apiResponse.FAILURE_RESP({}, {}, 'Unauthorized'));
      // }

      // Retrieve job details from cache
      const jobDetails = await jobCacheModel.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { job_id });
      const userExist = await jobModel.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, { user_id, job_id });

      if (!jobDetails) {
        return res
          .status(404)
          .json(apiResponse.FAILURE_RESP({}, {}, 'Job not found'));
      }

      if (userExist) {
        return res
          .status(409)
          .json(apiResponse.SUCCESS_RESP({}, 'Already applied'));
      }

      const { job_application_form } = body;

      const jobPayload = {
        job_id,
        user_id,
        provider_id: jobDetails.provider_id,
        provider_descriptor: jobDetails.provider_descriptor,
        job_descriptor: jobDetails.job_descriptor,
        creator_descriptor: jobDetails.creator_descriptor,
        content_metadata: jobDetails.content_metadata,
        fulfillments: jobDetails.fulfillments,
        locations: jobDetails.locations,
        time: {
          created_at: new Date(),
          updated_at: new Date(),
        },
        is_applied_job: true,
        job_application_form: job_application_form,
      };

      // Call service method to apply the job
      await newService.applyJob(user_id, job_id, jobPayload);

      return res
        .status(200)
        .json(apiResponse.SUCCESS_RESP({}, 'Job applied successfully'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async getMyJoblist(req, res, next) {
    try {
      const { query, headers } = req;
      const decoded = await jwtInstance.verify(
        headers.authorization.split(' ')[1]
      );
      const page_no = parseInt(query?.page_no) || 1;
      const per_page = parseInt(query?.per_page) || 10;
      delete query?.page_no
      delete query?.per_page
      const sort = {}

      const user_id = decoded.id;
      const { is_applied_job, job_name } = query;

      const filterQuery: any = {
        state: "Created"
      }
      if (decoded.role.code !== "SEEKER_ADMIN") {
        filterQuery.user_id = user_id
      }
      
      if (is_applied_job == 'true' || is_applied_job) {
        filterQuery["is_applied_job"] = true
      }
      if (job_name) {
        filterQuery['job_descriptor.name'] = {
          $regex: job_name,
          $options: 'i',
        };
      }
      const resp = await newService.getMyJoblist(filterQuery, page_no, per_page, sort);

      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Job Data retrieved Successfully"))
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async getMyJob(req, res, next) {
    try {
      const { params, headers } = req;
      const decoded = await jwtInstance.verify(headers.authorization.split(' ')[1]);
      const user_id = decoded.id

      const resp = await newService.getMyJob({
        job_id: params?.id,
        user_id: user_id,
        state: "Created"
      });

      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, 'success'));
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(apiResponse.FAILURE_RESP({},
        {
          name: 'Handler Error', message: `${err}`,
        }, 'Handler error'
      )
      );
    }
  }

  async getAllJobListing(req, res, next) {
    try {
      const { query } = req
      const page_no = parseInt(query?.page_no) || 1;
      const per_page = parseInt(query?.per_page) || 10;
      delete query?.page_no
      delete query?.per_page

      const sort = {}
      const filterQuery = {
        state: "Created"
      }
      const resp = await newService.getAllJobListing(filterQuery, page_no, per_page, sort)
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async getAllApplication(req, res, next) {
    try {
      const { query } = req
      const page_no = parseInt(query?.page_no) || 1;
      const per_page = parseInt(query?.per_page) || 10;
      delete query?.page_no
      delete query?.per_page
      const filterQuery = {
        state: "Created"
      }

      const sort = {}

      const resp = await newService.getAllApplication(filterQuery, page_no, per_page, sort)
      return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, resp?.data, "Data retrieved Successfully"))
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async getAllJobProvider(req, res, next) {
    try {
      const { query } = req
      const page_no = parseInt(query?.page_no) || 1;
      const per_page = parseInt(query?.per_page) || 10;
      delete query?.page_no
      delete query?.per_page

      const sort = {}

      const resp = await newService.getAllJobProvider(query, page_no, per_page, sort)
      return res.status(200).json(apiResponse.SUCCESS_RESP(resp, "Data retrieved Successfully"))
    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error',
            message: `${err}`,
          },
          'Handler error'
        )
      );
    }
  }

  async recommendedJobs(req, res, next) {
    try {
      const { headers, query } = req;

      const decoded = await jwtInstance.verify(
        headers.authorization.split(' ')[1]
      );

      const user_id = decoded.id;
      const user_profile: any = await user_profile_model.findOne(
        GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
        { user_id: user_id }
      );
      if (user_profile) {
        const job_role_query = new Set<string>();
        const job_skills_query = new Set<string>();

        // Combine work preferences, work experiences, and skills processing
        [user_profile?.work_preference, user_profile?.work_experience]
          .forEach(list => {
            list?.forEach(item => {
              if (item?.seeking_role) {
                job_role_query.add(item.seeking_role);
              } else if (item?.role) {
                job_role_query.add(item.role);
              }
            });
          });

        user_profile?.skills?.forEach(skill => {
          if (skill?.code) {
            job_skills_query.add(skill.code);
          }
        });

        const job_role_query_array = Array.from(job_role_query);
        const job_skills_query_array = Array.from(job_skills_query);

        console.log("job_role_query_array", job_role_query_array);
        console.log("job_skills_query_array", job_skills_query_array);
        const job_cache_query = {
          $or: [
            // Check for matching name/role in job_descriptor.name (case-insensitive using $regex)
            {
              'job_descriptor.name': {
                $in: job_role_query_array.map(role => new RegExp(role, 'i')) // Use the RegExp constructor directly for case-insensitive match
              }
            },

            // Check for matching name/role in content_metadata.listing_details.list where descriptor.code is 'job-role' (case-insensitive using $regex)
            {
              'content_metadata.listing_details.list': {
                $elemMatch: {
                  'descriptor.code': 'job-role',
                  'value': { $in: job_role_query_array.map(role => new RegExp(role, 'i')) }
                }
              }
            },

            // Check for matching skills in content_metadata.job_requirements.list where descriptor.code is 'req-prof-skills' (case-insensitive using $regex)
            {
              'content_metadata.job_requirements.list': {
                $elemMatch: {
                  'descriptor.code': 'req-prof-skills',
                  'value': { $in: job_skills_query_array.map(skill => new RegExp(skill, 'i')) }
                }
              }
            }
          ]
        };

        const page_no = parseInt(query.page_no as string) || 1;
        const per_page = parseInt(query.per_page as string) || 10;
        const sort = {};

        const resp = await newService.getAllCacheJobs(
          job_cache_query,
          page_no,
          per_page,
          sort
        );

        const jobs = resp?.data.map(job => {
          const { saved_userIds, applied_userIds, ...restOfJob } = job;
          return {
            ...restOfJob,
            is_saved: saved_userIds?.includes(decoded?.id) || false,
            is_applied: applied_userIds?.includes(decoded?.id) || false
          };
        });


        return res.status(200).json(apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, jobs, "Jobs Data retrieved Successfully"))

      } else {
        return res.status(404).json(
          apiResponse.FAILURE_RESP(
            {},
            { name: 'Not Found', message: 'User not found' },
            'User not found'
          )
        );
      }


    } catch (err) {
      console.log('Handler Error in saveCourse ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          {
            name: 'Handler Error in saveCourse',
            message: `${err}`,
          },
          'Handler error in saveCourse'
        )
      );
    }
  }



  async recommendedCourses(req, res, next) {
    try {
      const { headers, query } = req;

      // Validate Authorization header
      if (!headers.authorization || !headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json(
          apiResponse.FAILURE_RESP(
            {},
            { name: 'Unauthorized', message: 'Missing or invalid authorization token' },
            'Unauthorized access'
          )
        );
      }

      let decoded;
      try {
        decoded = await jwtInstance.verify(headers.authorization.split(' ')[1]);
      } catch (err) {
        return res.status(401).json(
          apiResponse.FAILURE_RESP(
            {},
            { name: 'Unauthorized', message: 'Invalid token' },
            'Unauthorized access'
          )
        );
      }

      const user_id = decoded.id;
      const user_profile = await user_profile_model.findOne(
        GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME,
        { user_id: user_id }
      );

      // Handle case where user profile is not found
      if (!user_profile) {
        return res.status(404).json(
          apiResponse.FAILURE_RESP(
            {},
            { name: 'Not Found', message: 'User profile not found' },
            'User profile not found'
          )
        );
      }

      const job_role_query = new Set<string>();
      const job_skills_query = new Set<string>();

      // Combine work preferences, work experiences, and skills processing
      [user_profile?.work_preference, user_profile?.work_experience]
        .forEach(list => {
          list?.forEach(item => {
            if (item?.seeking_role) {
              job_role_query.add(item.seeking_role);
            } else if (item?.role) {
              job_role_query.add(item.role);
            }
          });
        });

      // Process skills
      user_profile?.skills?.forEach(skill => {
        if (skill?.code) {
          job_skills_query.add(skill.code);
        }
      });

      const job_role_query_array = Array.from(job_role_query);
      const job_skills_query_array = Array.from(job_skills_query);

      // Log arrays
      console.log("job_role_query_array", job_role_query_array);
      console.log("job_skills_query_array", job_skills_query_array);

      // Create RegExp for case-insensitive match
      const createRegExpArray = (items: string[]) => items.map(item => new RegExp(item, 'i'));

      // Construct query with RegExp
      const job_cache_query = {
        $or: [
          {
            'job_descriptor.name': {
              $in: createRegExpArray(job_role_query_array) // Use RegExp array
            }
          },

          {
            'content_metadata.listing_details.list': {
              $elemMatch: {
                'descriptor.code': 'job-role',
                'value': { $in: createRegExpArray(job_role_query_array) } // Use RegExp array
              }
            }
          },

          {
            'content_metadata.job_requirements.list': {
              $elemMatch: {
                'descriptor.code': 'req-prof-skills',
                'value': { $in: createRegExpArray(job_skills_query_array) } // Use RegExp array
              }
            }
          }
        ]
      };

      // Log constructed query
      console.log("Constructed job_cache_query:", JSON.stringify(job_cache_query, null, 2)); // Pretty-print JSON query

      const page_no = parseInt(query.page_no as string) || 1;
      const per_page = parseInt(query.per_page as string) || 10;
      const sort = {};

      // Fetch jobs based on the constructed query
      const resp = await newService.getAllCacheJobs(
        job_cache_query,
        page_no,
        per_page,
        sort
      );

      // Process jobs data
      const jobs = resp?.data.map(job => {
        const { saved_userIds, applied_userIds, ...restOfJob } = job;
        return {
          ...restOfJob,
          is_saved: saved_userIds?.includes(decoded?.id) || false,
          is_applied: applied_userIds?.includes(decoded?.id) || false
        };
      });

      // Return successful response with jobs and pagination
      return res.status(200).json(
        apiResponse.SUCCESS_RESP_WITH_PAGINATION(resp?.pagination, jobs, "Jobs Data retrieved Successfully")
      );

    } catch (err) {
      console.log('Handler Error in recommendedCourses ===========>>>> ', err);
      return res.status(500).json(
        apiResponse.FAILURE_RESP(
          {},
          { name: 'Handler Error in recommendedCourses', message: `${err}` },
          'Handler error in recommendedCourses'
        )
      );
    }
  }

  async getJobOrderByTransactionId(req, res, next) {
    try {
      const { body, params, headers } = req;
      const decoded = await jwtInstance.verify(headers.authorization.split(' ')[1]);
      const query = {
        transaction_id: params?.transaction_id,
      };
      const jobOrder = await jobModel.findOne(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, query)
      if (jobOrder) {
        return res.status(200).json(apiResponse.SUCCESS_RESP(jobOrder, "Data Retrieved Successfully"))
      } else {
        return res.status(500).json(apiResponse.FAILURE_RESP({}, {
          name: "Record Not Found Error",
          message: `Record Not Found`
        }, "Record Not Found"))
      }

    } catch (err) {
      console.log('Handler Error ===========>>>> ', err);
      return res.status(500).json(apiResponse.FAILURE_RESP({},
        {
          name: 'Handler Error', message: `${err}`,
        }, 'Handler error'
      )
      );
    }
  }



}

export default Handler;
