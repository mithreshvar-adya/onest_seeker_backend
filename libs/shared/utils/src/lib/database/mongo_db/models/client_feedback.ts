// @ts-nocheck
import { Expose } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';

export class clientFeedback extends BaseModel{

  private static instance: clientFeedback | null = null;

  // Static method to get the singleton instance
  public static getInstance(): clientFeedback {
    if (this.instance === null) {
        this.instance = new clientFeedback();
    }
    return this.instance;
  }

  constructor() {
    super('client_feedback');
    this.id = uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  @Expose()
  id: string;

  @Expose()
  name: string = '';

  @Expose()
  email: string = '';

  @Expose()
  mobile_number: string = '';

  @Expose()
  comments: string = '';

  public async createClientFeedback(dbUrl, dbName, data: any) {
    const lookup = new clientFeedback();
    Object.assign(lookup, data);
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

    await db.collection(lookup._collectionName).insertOne(lookup);
    return lookup;
  }

  async createMany(dbUrl:any, dbName:any, select:any, payload:any) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const clientFeedbackCollection = db.collection(this._collectionName);

      const data = payload.map(item => {
        const clientFeedbackInstance = new clientFeedback();

        Object.assign(clientFeedbackInstance, item);

        return clientFeedbackInstance;
      });

      const result = await clientFeedbackCollection.insertMany(data);

      return {
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds),
      };
    } catch (err) {
      console.log("DB Error in createMany ==========>>>", err)
      throw err
    }
  }

  async get(dbUrl:any, dbName:any, select:any, query:any) {
    try {
      const client_Feedback = new clientFeedback();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      return await db.collection(clientFeedback._collectionName).findOne(query, {
        projection: select
      });
    } catch (err) {
      console.log("DB Error in get ==========>>>", err)
      throw err
    }
  }

  async getAll(dbUrl:any, dbName:any, select:any, query:any, skip:any = 0, take:any = 10, orderBy:any = {}) {
    try {
      const client_Feedback = new clientFeedback();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
  
      return await db.collection(clientFeedback._collectionName)
        .find(query, { projection: select })
        .toArray();
    } catch (err) {
        console.log("DB Error in getAll ==========>>>", err)
        throw err
    }
  }

  async get_pagination(dbUrl:any, dbName:any, page_no:any = 1, per_page:any = 10, query:any = {}) {
      const client_Feedback = new clientFeedback();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

      const collection = db.collection(clientFeedback._collectionName);
       
      if (per_page === -1) {
        const total_record = await collection.countDocuments(query);

        const pagination = {
            "per_page": total_record, // Show all records
            "page_no": 1,
            "total_rows": total_record,
            "total_pages": 1,
            "data": await collection.find(query, { projection: select }).toArray() // Fetch all data
        };
        return pagination;
      } else {
          const skip_record = (page_no - 1) * per_page;

          const total_record = await collection.countDocuments(query);

          const data = await collection
              .find(query)
              .skip(skip_record)
              .limit(per_page)
              .toArray();

          const total_pages = Math.ceil(total_record / per_page);

          const pagination = {
              "per_page": per_page,
              "page_no": page_no,
              "total_rows": total_record,
              "total_pages": total_pages,
              "data": data
          };

          return pagination;
      }
  }

  async update(dbUrl:any, dbName:any, select:any, query:any, payload:any) {
    try {
      const client_Feedback = new clientFeedback();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      await db.collection(clientFeedback._collectionName).updateOne(query, { $set: payload });
      return await this.get(query);
    } catch (err) {
        console.log("DB Error in update ==========>>>", err)
        throw err
    }
  }

  async delete(dbUrl:any, dbName:any, select:any, query:any) {
    try {
      const client_Feedback = new clientFeedback();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      return await db.collection(clientFeedback._collectionName).deleteOne(query);
    } catch (err) {
      console.log("DB Error in delete ==========>>>", err)
      throw err
    }
  }

}
