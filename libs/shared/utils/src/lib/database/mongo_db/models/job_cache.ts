// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


class SubLocation {
    id: string;
    city: {
        name: string
        code: string
    }
    state: {
        name: string
        code: string
    }
}
class SubFulfillment {
    id: string;
    type: string
}

class CacheMedia {
    mimetype: string;
    url: string;
}
class CacheDescriptor {
    name: string
    long_description: string
    short_description: string
    images: []
    media: [];
}
class CacheSubSchema_1 {
    name: string;
    code: string
    value: string
    display: boolean = true
}
class TagList {
    list: Array
}
class CacheMetadata {
    // all are 2d array
    academic_eligibility: []
    job_requirements: []
    job_responsibilities: []
    listing_details: []
    salary_info: []
    emp_details: []
    document: []
    required_docs: []
}
export class JobCache extends BaseModel {

    private static instance: JobCache | null = null;

    // Static method to get the singleton instance
    public static getInstance(): JobCache {
      if (this.instance === null) {
          this.instance = new JobCache();
      }
      return this.instance;
    }

    constructor() {
        super('job_cache');
        this.id = uuidv4(); // Assign a UUID by default
    }

    id: string;
    context: object
    provider_id: string
    provider_descriptor: CacheDescriptor
    job_id: string
    job_descriptor: CacheDescriptor;
    content_metadata: CacheMetadata // items->tags
    fulfillments: []
    locations: []
    quantity: object
    saved_userIds: []
    applied_userIds: []
    is_Active: boolean
    
    createdAt = new Date()
    updatedAt = new Date() 
    

    async createCacheJob(dbUrl, dbName, data: any) {
        const job_cache = new JobCache();
        Object.assign(job_cache, data);
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        await db.collection(job_cache._collectionName).insertOne(job_cache);
        return job_cache;
    }

    async getCacheJobs(dbUrl, dbName, query: object) {
        try {
          const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    
          const jobs = await db
            .collection(this._collectionName)
            .findOne(query)
    
          return jobs;
        } catch (err) {
          console.error('Error finding jobs:', err);
          throw err;
        }
      }

    public async upsertJobCache(dbUrl, dbName, query, payload) {
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        const collection = db.collection(this._collectionName);
        const existingDoc = await collection.findOne(query);

        if (!existingDoc) {
            // payload.id = uuidv4();
            payload.createdAt = new Date();
            payload.is_Active = true
        }

        payload.updatedAt = new Date();
        return collection.findOneAndUpdate(
            query,
            { $set: payload },
            { upsert: true }
        );
    }

    async getUniqueJobRoles(dbUrl: string, dbName: string) {
        try {
            const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
            const result = await db.collection(this._collectionName).aggregate([
                { $unwind: '$content_metadata.listing_details' }, // Unwind the listing_details array
                { $unwind: '$content_metadata.listing_details.list' }, // Unwind the list array
                { $match: { 'content_metadata.listing_details.list.descriptor.code': 'job-role' } }, // Match job-role descriptor
                { $group: { _id: '$content_metadata.listing_details.list.value' } } // Group by the job role value to get unique entries
            ]).toArray();
            
            console.log("----", result, "----");
            return result;
        } catch (err) {
            console.error('Error fetching unique job roles:', err);
            throw err;
        }
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

    public async updateJob_Cache(dbUrl, dbName, query, updateOperation) {
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