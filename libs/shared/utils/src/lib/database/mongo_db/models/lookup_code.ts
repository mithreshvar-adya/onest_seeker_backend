// @ts-nocheck
import { Expose } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


export class LookupCode extends BaseModel {

  private static instance: LookupCode | null = null;

    // Static method to get the singleton instance
  public static getInstance(): LookupCode {
    if (this.instance === null) {
        this.instance = new LookupCode();
    }
    return this.instance;
  }

  constructor() {
    super('lookup_code');
    this.id = uuidv4(); // Assign a UUID by default
  }

  @Expose()
  id: string;

  @Expose()
  display_name: string;

  @Expose()
  lookup_type: string;

  @Expose()
  lookup_code: string;

  @Expose()
  is_active: boolean;

  @Expose()
  createdAt = new Date();

  @Expose()
  updatedAt = new Date();

  // @Expose()
  // lookup_codes:
  //   lookup_codes lookup_code[] @relation("child_codes")

  // public async saveUser() {
  //   const { db } = await DatabaseConnection.getInstance(
  //     appConfig.MONGO_DB_URL, appConfig.MONGO_DB_NAME
  //   );

  //   const count = await db
  //     .collection('users')
  //     .countDocuments({ $or: [{ email: this.email }, { mobile_number: this.mobile_number }] });

  //   if (count > 0) {
  //     // throw new Error('A user with this mobile number already exists.');
  //   }

  //   const result = await super.save();
  //   return result;
  // }

  public async createlook(dbUrl, dbName, data: any) {
    const lookup = new LookupCode();
    Object.assign(lookup, data);
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

    await db.collection(lookup._collectionName).insertOne(lookup);
    return lookup;
  }

  public async readUser(dbUrl, dbName, query: any, select_fields: any) {
   const lookup = new LookupCode();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return await db.collection(lookup._collectionName).findOne(query, { projection: select_fields });
  }

  public async get(dbUrl, dbName, query: any) {
   const lookup = new LookupCode();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return await db.collection(lookup._collectionName).findOne(query);
  }

  public async readAllUsers(dbUrl, dbName, query: any, select_fields: any, sort_criteria: any) {
   const lookup = new LookupCode();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

    return await db.collection(lookup._collectionName)
      .find(query, { projection: select_fields })
      .sort(sort_criteria)
      .toArray();
  }

  public async updateUser(dbUrl, dbName, query: any, data: any) {
   const lookup = new LookupCode();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(lookup._collectionName).updateOne(query, { $set: data });
    return await this.get(query);
  }

  public async deleteUser(dbUrl, dbName, query: any) {
   const lookup = new LookupCode();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return await db.collection(lookup._collectionName).deleteOne(query);
  }

  public async upsertUser(dbUrl, dbName, query: any, data: any) {
   const lookup = new LookupCode();
    const existingUser = await this.get(query);

    if (!existingUser) {
      const count = await this.readAllUsers({}, {}, {});
    //   data.code = await generateRandomAlphanumeric(8)
      data.id = count.length + 1;
    }

    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(lookup._collectionName).updateOne(query, { $set: data }, { upsert: true });
    return await this.get({ code: data?.code });
  }
}
