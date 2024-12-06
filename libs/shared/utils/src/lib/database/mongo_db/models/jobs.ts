// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


class SubLocation {
  id: string;
  city: {
    name: string;
    code: string;
  };
  state: {
    name: string;
    code: string;
  };
}
class SubFulfillment {
  id: string;
  type: string;
}
class CacheMedia {
  mimetype: string;
  url: string;
}
class CacheDescriptor {
  name: string;
  long_description: string;
  short_description: string;
  images: [];
  media: [];
}
class CacheSubSchema_2 {
  name: string;
  code: string;
  value: string;
  display: boolean = true;
}
class CacheSubSchema_1 {
  list: CacheSubSchema_2[]
  display: boolean = true
  name: string;
  code: string;
}
class CacheMetadata {
  academic_eligibility: []
  job_requirements: []
  job_responsibilities: []
  listing_details: []
  salary_info: []
  emp_details: []
  document: []
  required_docs: []
}
class JobApplicationForm {
  first_name: string;
  last_name: string;
  email_id: string;
  phone_number: string;
  applied_position: string;
  earliest_possible_start_date: Date;
  cover_letter: string;
  preferred_date: Date;
  resume: string; // URL to resume
  additional_links: { name: string; url: string }[];
}

export class Jobs extends BaseModel {

  private static instance: Jobs | null = null;

  // Static method to get the singleton instance
  public static getInstance(): Jobs {
      if (this.instance === null) {
          this.instance = new Jobs();
      }
      return this.instance;
  }

  constructor() {
    super('jobs');
    this.id = uuidv4(); // Assign a UUID by default
  }

  id: string;
  order_id: string;
  job_id: string;
  user_id: string;
  transaction_id: string
  message_id: string
  context: object
  provider_id: string;
  provider_descriptor: CacheDescriptor;
  job_descriptor: CacheDescriptor;
  content_metadata: CacheMetadata; // items->tags
  fulfillments: [];
  locations: [];
  quantity: object
  time: object;
  is_applied_job: boolean = false;
  is_saved_job: boolean = false;
  job_application_form: JobApplicationForm;
  state: String = "draft"
  fulfillment_status: object

  select_req: object
  onselect_resp: object
  init_req: object
  oninit_resp: object
  confirm_req: object
  onconfirm_resp: object
  cancel_req: object
  oncancel_resp: object
  update_req: Array
  onupdate_resp: Array
  track_req: Array
  ontrack_resp: Array
  support_req: object
  onsupport_resp: object
  status_req: Array
  onstatus_resp: Array
  status_history: Array

  createdAt = new Date()
  updatedAt = new Date()

  async find(dbUrl, dbName, query: object) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

      const jobs = await db
        .collection(this._collectionName)
        .find(query)
        .toArray();

      console.log('111', jobs);
      return jobs;
    } catch (err) {
      console.error('Error finding jobs:', err);
      throw err;
    }
  }

  public async createJobRecord(dbUrl, dbName, data: any) {
    const job_record = new Jobs();
    Object.assign(job_record, data);
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(job_record._collectionName).insertOne(job_record);
    return job_record;
  }

  

public async getAllJobListing(dbUrl, dbName, page = 1, limit = 10, query, select_fields, sort) {
  try {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    const projectionFields = {
      _id: 0,
      context: 0,
      transaction_id: 0,
      message_id: 0,
      content_metadata: 0,
      fulfillments: 0,
      locations: 0,
      quantity: 0,
      time: 0,
      is_applied_job: 0,
      is_saved_job: 0,
      state: 0,
    };

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: query },
      { $project: projectionFields },
      {
        $lookup: {
          from: "users",                   // Join with the users collection
          localField: "user_id",           // Use user_id as the local field
          foreignField: "id",              // Use id as the foreign field
          as: "applicants",                // Output to applicants array
          pipeline: [
            {                            
              $lookup: {
                from: "user_profiles",          // Join with the user_profiles collection
                localField: "id",               // Use id from users as the local field
                foreignField: "user_id",        // Use user_id as the foreign field
                as: "profile_details"           // Output to profile_details array
              }
            },
            { $unwind: "$profile_details" },    // Unwind profile_details array to access individual profiles
            {                            
              $project: {
                _id: 0,                  
                id: 1,              
                email: 1,             
                first_name: 1,        
                mobile_number: 1,
                profile_image: 1,
                dob: 1,
                age: 1,
                profession: 1,
                language_preference: 1,
                gender: 1,
                nationality: 1,
                address: 1,
                skills: "$profile_details.skills",
                work_experience: "$profile_details.work_experience",
                education_details: "$profile_details.education_details",
                goals: "$profile_details.goals"
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "job_cache",               // Join with the job_cache collection
          localField: "job_id",            // Use job_id as the local field
          foreignField: "job_id",          // Use job_id as the foreign field
          as: "job_details"                // Output to job_details
        }
      },
      { 
        $unwind: "$job_details"            // Unwind the job_details array
      },
      {
        $addFields: {
          "applicants.status": "$fulfillment_status" 
        }
      },
      {
        $group: {
          _id: "$job_details.job_id",      // Group by job_id to prevent duplicates
          job_details: { $first: "$job_details" },  // Keep the first job details per group
          applicants: { $push: { $arrayElemAt: ["$applicants", 0] } }  // Flatten the applicants array
        }
      },
      {
        $project: {
          _id: 0,                          
          job_details: 1,             
          applicants: 1               
        }
      }
    ];

    if (limit !== -1) {
      pipeline.push(
        { $skip: skip },  
        { $limit: limit }   
      );
    }

    const result = await db.collection(this._collectionName).aggregate(pipeline).toArray();
    
    const totalCount = result.length;

    return {
      data: result,
      pagination: limit !== -1 ? {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount
      } : {
        currentPage: 1,
        totalPages: 1,
        totalItems: totalCount
      }
    };

  } catch (err) {
    console.error('Error in getAllJobListing:', err);
    throw err;
  }
}

  async getAllApplication(dbUrl, dbName, page = 1, limit = 10, query, select_fields, sort) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Create the aggregation pipeline
      const pipeline = [
        { $match: query || {} },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$user_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$id', '$$userId'] } } },
              { 
                $project: {
                  _id: 0,
                  first_name: 1,
                  last_name: 1,
                  email: 1,
                  mobile_number: 1,
                  profile_image: 1,
                }
              }
            ],
            as: 'user_detail'
          }
        },
        { $unwind: '$user_detail' },       // Flatten the "user_details" array
        // {
        //   $lookup: {
        //     from: 'job_cache',         
        //     localField: 'job_id',    
        //     foreignField: 'job_id',     
        //     as: 'job_details'          
        //   }
        // },
        // { $unwind: '$job_details' },        // Flatten the "job_details" array
        {
          $project: {
            _id: 0,              
            provider_descriptor: 1,
            job_descriptor: 1,
            job_id: 1,
            content_metadata: 1,
            fulfillments: 1,
            fulfillment_status: 1,
            locations: 1,
            // provider_id: 1,                      
            // job_description: '$job_details.job_descriptor',
            // provider_description: '$job_details.provider_descriptor',
            user_detail: 1,
          }
        }
      ];

      if (sort && Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
      }

      // Get total count using the same pipeline without pagination
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: 'total' });
      const countResult = await db.collection(this._collectionName).aggregate(countPipeline).toArray();
      const totalCount = countResult[0]?.total || 0;

      // Add pagination if limit is not -1
      if (parseInt(limit) !== -1) {
        pipeline.push(
          { $skip: skip },
          { $limit: parseInt(limit) }
        );
      }

      // Execute the main aggregation
      const result = await db.collection(this._collectionName).aggregate(pipeline).toArray();

      return {
        data: result,
        pagination: {
          per_page: parseInt(limit),
          page_no: parseInt(page),
          total_rows: totalCount,
          total_pages: parseInt(limit) === -1 ? 1 : Math.ceil(totalCount / parseInt(limit))
        }
      };

    } catch (err) {
      console.error('Error in getAllApplicationsWithUserName:', err);
      throw err;
    }
  }

  async getAllJobProvider(dbUrl, dbName, page = 1, limit = 10, query, select_fields, sort) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

      const skip = (page - 1) * limit;

      const pipeline = [
        { $match: query },
        
        {
          $group: {
            _id: {
              provider_id: "$provider_id",
              provider_name: "$provider_descriptor.name",
              provider_descp: "$provider_descriptor.short_description",
              job_id: "$job_id",
              job_name: "$job_descriptor.name"
            },
            total_job: { $sum: 1 } // Count the number of applications for each job_name
          }
        },
        
        // Second group by provider_id to aggregate job data and total applications
        {
          $group: {
            _id: {
              provider_id: "$_id.provider_id",
              provider_name: "$_id.provider_name",
              provider_descp: "$_id.provider_descp"
            },
            total_applied_jobs: { $sum: "$total_job" }, // Total number of job applications
            all_job_data: {
              $push: {
                job_name: "$_id.job_name",
                total_job: "$total_job"
              }
            }
          }
        },
        
        {
          $project: {
            _id: 0,
            provider_id: "$_id.provider_id",
            provider_name: "$_id.provider_name",
            provider_descp: "$_id.provider_descp",
            total_applied_jobs: 1,
            all_job_data: 1
          }
        }
      ];

      if (limit !== -1) {
        pipeline.push(
          { $skip: skip },    
          { $limit: limit }   
        );
      }

      const result = await db.collection(this._collectionName).aggregate(pipeline).toArray();

      const totalCount = result.length;

      return {
        data: result,
        pagination: limit !== -1 ? {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount
        } : {
          currentPage: 1,
          totalPages: 1,
          totalItems: totalCount
        }
      };

    } catch (err) {
        console.error('Error in getAllJobProvider:', err);
        throw err;
    }
  }

  async total_count(dbUrl, dbName, query){
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    const collection = db.collection('jobs');
    const total_record = await collection.countDocuments(query);
    return total_record
  }

  async List(dbUrl, dbName, page: any = '1', limit: any = 10, filters = {}, select_fields, sort: any) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    const count = await db
      .collection(this._collectionName)
      .countDocuments(filters);
    const projectionFields = { ...select_fields };

    // const data = await db
    //   .collection(this._collectionName)
    //   .find(filters, { projection: select_fields })
    //   .sort(sort)
    //   .skip((parseInt(page) - 1) * parseInt(limit))
    //   .limit(parseInt(limit))
    //   .toArray();
    // const total_pages = Math.ceil(count / limit);

    const pipeline = [
      { $match: filters },
      {
        $lookup: {
          from: 'users',              
          localField: 'user_id',      
          foreignField: 'id',        
          as: 'user_details'         
        }
      },
      { $unwind: '$user_details' },       // Flatten the "user_details" array
     
      {
        $project: {                      
          user_name: { $concat: ['$user_details.first_name', ' ', '$user_details.last_name'] }, 
          ...projectionFields    
        }
      }
    ];

    
    let data;
    if (parseInt(limit) === -1) {
      // Fetch all records without pagination
      data = await db
        .collection(this._collectionName)
        .aggregate(pipeline)
        .sort(sort)
        .toArray();
    } else {
      // Fetch records with pagination
      data = await db
        .collection(this._collectionName)
        .aggregate(pipeline)
        .sort(sort)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .toArray();
    }
    const total_pages = limit === -1 ? 1 : Math.ceil(count / limit);
    let object = {}
    object["data"] = data;
    object["pagination"] = {};
    object["pagination"]["per_page"] = limit === -1 ? count : limit;
    object["pagination"]["page_no"] = page;
    object["pagination"]["total_rows"] = data?.length;
    object["pagination"]["total_pages"] = total_pages
    return { data: data, pagination: object.pagination };
  }

  async deleteJob(dbUrl, dbName, query){
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    const collection = db.collection('jobs');
    await collection.deleteMany(query);
    return "deleted"
}

 
}
