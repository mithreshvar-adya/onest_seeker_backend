// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


export class CacheMedia {
    mimetype: string;
    url: string;
}
export class CacheDescriptor {
    name: string
    long_description: string
    short_description: string
    images: []
    media: [];
}
export class CacheSubSchema_1 {
    name: string;
    code: string
    value: string
}

export class CacheMetadata {
    learner_level: []
    prerequisite: []
    lang_code: []
    course_duration: []
    learning_objective: []
    display: boolean
  }

export class CourseCache extends BaseModel {

  private static instance: CourseCache | null = null;

    // Static method to get the singleton instance
    public static getInstance(): CourseCache {
        if (this.instance === null) {
            this.instance = new CourseCache();
        }
        return this.instance;
    }

    constructor() {
        super('course_cache');
        this.id = uuidv4(); // Assign a UUID by default
        this.createdAt = new Date();
        this.updatedAt = new Date(); 
    }

    id: string;
    context: object
    provider_id: string
    provider_descriptor: CacheDescriptor
    fulfillments: []
    categories: []
    course_id: string
    course_descriptor: CacheDescriptor;
    creator_descriptor: CacheDescriptor;
    content_metadata: CacheMetadata // items->tags
    category_ids: []
    // fulfillment_ids: []
    price: object
    quantity: object
    ratings: number
    rateable: boolean
    total_price: number
    // is_popular: boolean = false
    // is_recent_viewed: boolean = false
    provider_performance: string  // bestseller
    purchased_userIds: []
    saved_userIds: []
    is_active: boolean

    createdAt: Date;
    updatedAt: Date

    async createCourse(dbUrl, dbName, data: any) {
        try {
            const courseCache = new CourseCache();
            Object.assign(courseCache, data);
            const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
            const collection = db.collection('course_cache');
            const result = await collection.insertOne(courseCache);
            return result
          } catch (err) {
            console.log("DB Error ==========>>>", err);
            throw err;
          }
    }

    async deleteCourse(dbUrl, dbName, query){
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        const collection = db.collection('course_cache');
        await collection.deleteMany(query);
        return "deleted"
    }

    public async landPagelist(dbUrl, dbName, page: any = '1', limit: any = 10, filters = {}, select_fields: any, sort: any) {
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    //     return db.collection(this._collectionName).
    //     find(filters, { projection: select_fields })
    //     .skip((parseInt(page) - 1) * parseInt(limit))
    //     .limit(parseInt(limit))
    //     .sort(sort)
    //     .toArray()
    //   }
    let data;
      if (parseInt(limit) === -1) {
        // Fetch all records without pagination
        data = await db
          .collection(this._collectionName)
          .find(filters, { projection: select_fields })
          .sort(sort)
          .toArray();
      } else {
        // Fetch records with pagination
        data = await db
          .collection(this._collectionName)
          .find(filters, { projection: select_fields })
          .sort(sort)
          .skip((parseInt(page) - 1) * parseInt(limit))
          .limit(parseInt(limit))
          .toArray();
      }
      return data

    }


    public async upsertCourseCache(dbUrl, dbName, query, payload) {
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        const collection = db.collection(this._collectionName);
        const existingDoc = await collection.findOne(query);

        if (!existingDoc) {
            // payload.id = uuidv4();
            payload.createdAt = new Date();
            payload.is_active = true;
        }

        payload.updatedAt = new Date();
        return collection.findOneAndUpdate(
            query,
            { $set: payload },
            { upsert: true }
        );
    }
    async getUniqueProviderDescriptors(dbUrl: string, dbName: string) {
        try {
            const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
            const result = await db.collection(this._collectionName).aggregate([
                { $group: { _id: "$provider_id", providerDescriptor: { $first: "$provider_descriptor" } } },
                { $project: { _id: 0, providerId: "$_id", providerDescriptor: 1 } }
            ]).toArray();
            console.log(result)
            return result;
        } catch (err) {
            console.error('Error fetching unique provider descriptors:', err);
            throw err;
        }
    }

    async getUniqueCategoryIds(dbUrl: string, dbName: string) {
        try {
            const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
            const result = await db.collection(this._collectionName).aggregate([
                { $unwind: "$category_ids" }, 
                { $group: { _id: "$category_ids" } } 
            ]).toArray();
            
           
            return result;
        } catch (err) {
            console.error('Error fetching unique category IDs:', err);
            throw err;
        }
    }

    async updateCourseCache(dbUrl, dbName, query, updateOperation) {
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        return db.collection(this._collectionName).updateOne(
          query,
          updateOperation,
          { upsert: false } 
        );
    }

    public async deleteMany(dbUrl, dbName, query) {
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        const deleted = await db.collection(this._collectionName).deleteMany(query);

        return deleted
    }

}  