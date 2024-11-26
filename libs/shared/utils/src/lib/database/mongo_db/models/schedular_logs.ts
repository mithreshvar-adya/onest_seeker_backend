// @ts-nocheck
import { Expose } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@adya/shared';


export class Schedular_logs{

  private static instance: Schedular_logs | null = null;

    // Static method to get the singleton instance
    public static getInstance(): Schedular_logs {
        if (this.instance === null) {
            this.instance = new Schedular_logs();
        }
        return this.instance;
    }

  public _collectionName;
  constructor() {
    this._collectionName = 'schedular_logs';
    this.id = uuidv4(); // Assign a UUID by default
  }

  @Expose()
  id: string;

  @Expose()
  schedular_id: number;

  // @Expose()
  // schedular

  @Expose()
  start_time = new Date();

  @Expose()
  end_time = new Date();

  @Expose()
  logs: object;

  @Expose()
  status: string;

  @Expose()
  createdAt = new Date();

  @Expose()
  updatedAt = new Date();


  public async createSchedularLogs(dbUrl, dbName, select: any, payload: any) {
    try {
      const schedular_logs = new Schedular_logs();
      Object.assign(schedular_logs, payload);
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('schedular_logs');
      
      const result = await collection.insertOne(schedular_logs);
      
      const SchedularLogs = await collection.findOne({ _id: result.insertedId }, { projection: select });
      
      return SchedularLogs;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async getSchedularLogs(dbUrl, dbName, select: any, query: any) {
    try {    
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('schedular_logs');
      const SchedularLogs = await collection.findOne(query, { projection: select });

      return SchedularLogs;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async updateSchedularLogs(dbUrl, dbName, select: any, query: any, payload: any) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('schedular_logs');
      
      const result = await collection.findOneAndUpdate(query, { $set: payload }, { returnDocument: 'after', projection: select });

      const SchedularLogs = result.id;
      console.log("schedular_log update id: ", SchedularLogs);
      
      return SchedularLogs;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }
}
