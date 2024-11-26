// @ts-nocheck

import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '@adya/shared';
import { BaseModel } from './base_model';

class Field {
  field_sequence: number;
  field_key: string;
  field_name: string;
  env_key: string;
  placeholder: string;
  field_type: string;
  attributes: object;
  is_mandatory: boolean = false;
  is_editable: boolean = true;
  allowed_values: any[] = []; // Array of mixed types
  value: any;

}

class Section {
  section_sequence: number;
  section_key: string;
  section_name: string;
  section_description: string;
  fields: Field[] = [];

}



export class UserServerSettings extends BaseModel {

  private static instance: UserServerSettings | null = null;

  // Static method to get the singleton instance
  public static getInstance(): UserServerSettings {
      if (this.instance === null) {
          this.instance = new UserServerSettings();
      }
      return this.instance;
  }

  constructor() {
    super('user_server_settings');
    this.id = uuidv4(); // Assign a UUID by default
  }

  id: number;
  code: string;
  logo: string;
  name: string;
  setting_type_id: number;
  // setting_type: SettingType;
  description: string;
  redirection_link: string;
  sections: Section[] = [];
  company_id: number;
  is_active: boolean = false;
  status: "ACTIVATED" | "DEACTIVATED" = "DEACTIVATED";
  documentation_link: string;
  banner_url: string;
  tag_text: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();


  public async getUserServerSettings(dbUrl, dbName, select: any, query: any) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('user_server_settings');
      const UserServerSettings = await collection.findOne(query, { projection: select });

      return UserServerSettings;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async createUserServerSettings(dbUrl, dbName, select: any, payload: any) {
    try {
      const user_server_setting = new UserServerSettings();
      Object.assign(user_server_setting, payload);
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('user_server_settings');
      const result = await collection.insertOne(user_server_setting);
      
      const UserServerSettings2 = await collection.findOne({ _id: result.insertedId }, { projection: select });
      return UserServerSettings2;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async getAllUserServerSettings(dbUrl, dbName, select:any, query:any, skip=0, take=-1, orderBy={}, distinct:any[]=[]) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('user_server_settings');

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

      const UserServerSettings = await collection.find(query, options).toArray();
      return UserServerSettings;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }

  public async updateUserServerSettings(dbUrl, dbName, select: any, query: any, payload: any) {
    try {
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      const collection = db.collection('user_server_settings');
      
      const result = await collection.findOneAndUpdate(query, { $set: payload }, { returnOriginal: false });
      
      // If a document was found and updated, it will be in result.value
      const UserServerSettings = result.id;
      console.log("user_server_setting update id: ", UserServerSettings);
      return UserServerSettings;
    } catch (err) {
      console.log("DB Error ==========>>>", err);
      throw err;
    }
  }
  
}

