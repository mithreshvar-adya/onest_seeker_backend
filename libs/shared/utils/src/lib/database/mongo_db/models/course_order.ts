// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


export class Media {
  mimetype: string;
  url: string;
}
export class Descriptor {
  name: string
  long_description: string
  short_description: string
  images: []
  media: [];
}
export class Metadata {
  learner_level: []
  prerequisite: []
  lang_code: []
  course_duration: []
  learning_objective: []
  display: boolean
}
export class SubSchema_1 {
  name: string;
  code: string 
  value: string 
}
export class BillingDetails {
  name: string;
  phone: string 
  email: string 
  address: string;
}
export class CompletionDetails {
  course_certificate: string
  course_badge: string
  completion_timestamp: string
  display: boolean
}
export class CourseDetails {
  id: string
  name: string
  long_description: string
  media: Media
}
export class Payments {
  params: object
  type: string
  status: string
  collected_by: string
}
export class Items {
  course_id: string
  course_descriptor: Descriptor;
  creator_descriptor: Descriptor;
  content_metadata: Metadata // items->tags
  course_outline: Descriptor[] // add-ons
  prelim_quiz: Descriptor[] // add-ons
  is_certificate_available: boolean
  category_ids: []
  fulfillment_ids: []
  categories: [] // matching categories
  fulfillments: [] // matching fulfillments
  price: object
  quantity: object
  course_materials: CourseDetails[] // fulfil->stops
  course_completion_details: CompletionDetails[]
  status: string
  ratings: number
  updated_at: string
  completion_percentage: number
  current_lesson: string
}

export class CourseOrder extends BaseModel {

  private static instance: CourseOrder | null = null;

    // Static method to get the singleton instance
    public static getInstance(): CourseOrder {
        if (this.instance === null) {
            this.instance = new CourseOrder();
        }
        return this.instance;
    }

    constructor() {
      super('course_orders');
      this.id = uuidv4(); // Assign a UUID by default
    }
  
    id: string;
    order_id: string
    user_id: string
    // np_name: string
    transaction_id: string
    message_id:string
    context: object
    provider_id: string
    provider_descriptor: Descriptor
    items: Items // for now, not an array
    invoice_link: string
    quote: object
    total_price: number
  
    categories: [] // full dump
    fulfillments: []  // full dump
    billing: BillingDetails
    payments: Array
    payment_status: String = "NOT-PAID" 
    is_enrolled: boolean = false
    is_saved_course: boolean = false;
    course_performance: string
    state: String = "draft"
    fulfillment_status: object;

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
    status_history:Array

    createdAt: string
    updatedAt: string
 

    async createCourse(dbUrl, dbName, data: any) {
      try {
        const courseOrder = new CourseOrder();
        Object.assign(courseOrder, data);
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        const collection = db.collection('course_orders');
        const result = await collection.insertOne(courseOrder);
        return result
      } catch (err) {
        console.log("DB Error ==========>>>", err);
        throw err;
      }
    }

    async deleteCourse(dbUrl, dbName, query){
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        const collection = db.collection('course_orders');
        await collection.deleteMany(query);
        return "deleted"
    }


    async listAll(dbUrl, dbName, page = 1, limit = 10, query, select_fields, sort) {
      try {
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    
        const projectionFields = { ...select_fields };
    
        const skip = (page - 1) * limit;
    
        const pipeline = [
          { $match: query },
          { $unwind: '$items' },           // Unwind the items array to access course_id
          {
            $lookup: {
              from: 'users',             
              localField: 'user_id',      
              foreignField: 'id',         
              as: 'students'             
            }
          },
          { $unwind: '$students' },        // Unwind students array to access individual students
          {
            $lookup: {
              from: 'user_profiles',             
              localField: 'user_id',      
              foreignField: 'user_id',         
              as: 'profile_details'             
            }
          },
          { $unwind: '$profile_details' },
          {
            $group: {                     
              _id: '$items.course_id',    // Use course_id as the grouping key
              course_id: { $first: '$items.course_id' },
              students: {
                $push: {
                  id: '$students.id',
                  name: '$students.first_name',  
                  email: '$students.email',
                  number: '$students.mobile_number',
                  profile_image: '$students.profile_image',
                  dob: '$students.dob',
                  age: '$students.age',
                  profession: '$students.profession',
                  language_preference: '$students.language_preference',
                  gender: '$students.gender',
                  nationality: '$students.nationality',
                  address: '$students.address',
                  skills:'$profile_details.skills',
                  work_experience:'$profile_details.work_experience',
                  education_details:'$profile_details.education_details',
                  goals:'$profile_details.goals',
                }
              },
              id: { $first: '$id' },
              user_id: { $first: '$user_id' },
              order_id: { $first: '$order_id' },
              items: { $first: '$items' },
              total_price: { $first: '$total_price' },
              provider_descriptor: { $first: '$provider_descriptor' }
            }
          },
          {
            $project: {
              _id: 0,
              course_id: 1,
              students: 1,
              ...projectionFields       
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
        console.log("DB Error ==========>>>", err);
        throw err;
      }
    }
    
    async getAllCertificate(dbUrl, dbName, page = 1, limit = 10, query, select_fields, sort) {
      try {
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    
        const skip = (page - 1) * limit;
    
        const pipeline = [
          { $match: { 'items.is_certificate_available': true } },
          {
            $project: {
              _id: 0,
              order_id: 1,
              user_id: 1,
              'items.course_id': 1,
              'items.course_descriptor': 1,
              'items.course_completion_details': 1,
              'billing.name': 1,
              'billing.phone': 1,
              'billing.email': 1,
              'billing.address': 1,
              total_price: 1,
              course_name: '$items.course_descriptor.name',
              course_id: 1
            },
          },
          {
            $group: {
              _id: '$items.course_id',
              order_id: { $first: '$order_id' },
              user_id: { $first: '$user_id' },
              items: { $first: '$items' },
              billing: { $first: '$billing' },
              total_price: { $first: '$total_price' },
              course_name: { $first: '$course_name' },
              course_id: { $first: '$course_id' },
            },
          },
          {
            $match: query.course_name ? { 'items.course_descriptor.name': query.course_name } : {}
          },
          {
            $project: {
              _id: 0,
              order_id: 1,
              user_id: 1,
              items: 1,
              billing: 1,
              total_price: 1,
              course_name: 1,
            },
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
        console.log("DB Error ==========>>>", err);
        throw err;
      }
    }

    async total_count(dbUrl, dbName, query){
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('course_orders');
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
    

}  