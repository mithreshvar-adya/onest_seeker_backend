// @ts-nocheck
import { Expose } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@adya/shared';


export class Schedulars {

  private static instance: Schedulars | null = null;

    // Static method to get the singleton instance
    public static getInstance(): Schedulars {
        if (this.instance === null) {
            this.instance = new Schedulars();
        }
        return this.instance;
    }

  public _collectionName;
  constructor() {
    this._collectionName = 'schedulars';
    this.id = uuidv4(); // Assign a UUID by default
  }
  
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  description: string;

  @Expose()
  frequency_type: string;

  @Expose()
  frequency_number: number;

  @Expose()
  type: string;

  @Expose()
  is_active: boolean;

  @Expose()
  createdAt = new Date();

  @Expose()
  updatedAt = new Date();

  @Expose()
  is_enabled: boolean;

  // @Expose()
  // schedular_logs

  @Expose()
  scheduling_time: object;

  @Expose()
  last_run_time: Date;

  // @Expose()
  // schedular_logs: Schedular_logs


  public async getSchedular(dbUrl, dbName, select: any, query: any) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('schedulars');
      const Schedular = await collection.findOne(query, { projection: select });

      return Schedular;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async createSchedular(dbUrl, dbName, select: any, payload: any) {
    try {
      const schedular = new Schedulars();
      Object.assign(schedular, payload);
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('schedulars');
      const result = await collection.insertOne(schedular);
      
      const Schedular = await collection.findOne({ _id: result.insertedId }, { projection: select });
      return Schedular;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async getAllSchedular(dbUrl, dbName, select:any, query:any, skip=0, take=-1, orderBy={}, distinct:any[]=[]) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('schedulars');

      let options: any = { projection: select };

      if (skip > 0) {
        options.skip = skip;
      }
      if (take > 0) {
        options.limit = take;
      }
      if (Object.keys(orderBy).length > 0) {
        options.sort = orderBy;
      }
      if (distinct.length > 0) {
        options.distinct = distinct;
      }

      const Schedular = await collection.find(query, options).toArray();
      return Schedular;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async updateSchedular(dbUrl, dbName, select: any, query: any, payload: any) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('schedulars');
      
      const result = await collection.findOneAndUpdate(query, { $set: payload }, { returnOriginal: false });
      
      // If a document was found and updated, it will be in result.value
      const Schedular = result.id;
      console.log("schedular update id: ", Schedular);
      return Schedular;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }
  
}

