import { Expose } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection, generateRandomAlphanumeric } from '@adya/shared';

export class LookUp {
  @Expose()
  lookup_code: string = '';

  @Expose()
  display_name: string = '';

  @Expose()
  id: number = 0;
}

export class RoleDetails {
  id: string = '';
  name: string = '';
  code: string = '';
}

export class User extends BaseModel {

  private static instance: User | null = null;

    // Static method to get the singleton instance
    public static getInstance(): User {
        if (this.instance === null) {
            this.instance = new User();
        }
        return this.instance;
    }
  
  constructor() {
    super('users');
    this.id = uuidv4(); // Assign a UUID by default
    this.is_active = true; // Set default is_active value
    this.is_new_user = true;
  }

  @Expose()
  id: string;

  @Expose()
  first_name: string = '';

  @Expose()
  middle_name: string = '';

  @Expose()
  last_name: string = '';

  @Expose()
  email: string = '';

  @Expose()
  mobile_number: string = '';

  @Expose()
  profile_image: string = '';

  @Expose()
  dob: string = '';

  @Expose()
  age: string = '';

  @Expose()
  profession: string = ''

  @Expose()
  language_preference?: LookUp[];

  @Expose()
  // @Type(() => LookUp)
  // gender?: LookUp;
  gender?: string;

  @Expose()
  // @Type(() => LookUp)
  nationality?: LookUp;

  @Expose()
  address: string = '';

  @Expose()
  accept_terms_and_conditions!: boolean;

  @Expose()
  otp: string = '';

  @Expose()
  // @Type(() => LookUp)
  role?: RoleDetails; 

  @Expose()
  is_active: boolean;

  @Expose()
  is_new_user: boolean;

  @Expose()
  last_login_date = new Date()

  @Expose()
  createdAt = new Date()

  @Expose()
  updatedAt = new Date()

  @Expose()
  // @Type(() => LookUp)
  status?: LookUp;

  @Expose()
  company_id: string = '';

  @Expose()
  parent_id: string = '';

  @Expose()
  branch_id: string = '';

  @Expose()
  partner_id: string = '';

  @Expose()
  created_by_id: string = '';

  @Expose()
  updated_by_id: string = '';


  public async saveUser(dbUrl:string, dbName:string) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

    const count = await db
      .collection('users')
      .countDocuments({ $or: [{ email: this.email }, { mobile_number: this.mobile_number }] });

    if (count > 0) {
      // throw new Error('A user with this mobile number already exists.');
    }

    const result = await super.save(dbUrl, dbName);
    return result;
  }

  public async createUser(dbUrl:string, dbName:string, data: any) {
    const user = new User();
    Object.assign(user, data);
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    // Check for the existence of a user with the same mobile number
    const count = await db
      .collection('users')
      .countDocuments({ $or: [{ email: data.email }, { mobile_number: data.mobile_number }] });

    if (count > 0) {
      // throw new Error('A user with this mobile number already exists.');
    }
    await db.collection(user._collectionName).insertOne(user);
    return user;
  }

  public async readUser(dbUrl:string, dbName:string, query: any, select_fields: any) {
    const user = new User();    
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return await db.collection(user._collectionName).findOne(query, { projection: select_fields });
  }

  public async get(dbUrl:string, dbName:string, query: any) {
    const user = new User();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return await db.collection(user._collectionName).findOne(query);
  }

  public async readAllUsers(dbUrl:any, dbName:any, query: any, select_fields: any, sort_criteria: any) {
    const user = new User();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    
    return await db.collection(user._collectionName)
      .find(query, { projection: select_fields })
      .sort(sort_criteria)
      .toArray();
  }

  public async updateUser(dbUrl:string, dbName:string, query: any, data: any) {
    const user = new User();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(user._collectionName).updateOne(query, { $set: data });
    return await this.get(dbUrl, dbName, query);
  }

  public async deleteUser(dbUrl:string, dbName:string, query: any) {
    const user = new User();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return await db.collection(user._collectionName).deleteOne(query);
  }

  public async upsertUser(dbUrl:string, dbName:string, query: any, data: any) {
    const user = new User();
    const existingUser = await this.get(dbUrl, dbName, query);

    if (!existingUser) {
      const count = await this.readAllUsers({}, {}, {}, {}, {});
      data.code = await generateRandomAlphanumeric(8)
      data.id = count.length + 1;
    }

    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(user._collectionName).updateOne(query, { $set: data }, { upsert: true });
    return await this.get(dbUrl, dbName, { code: data?.code });
  }
}
