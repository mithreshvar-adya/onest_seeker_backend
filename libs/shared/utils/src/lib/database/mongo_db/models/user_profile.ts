// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';

export class UserProfileLookUp {
  id: number = 0;
  lookup_code: string = '';
  display_name: string = '';
}
export class Docs {
  sequence: number;
  name: string;
  file_type: string = '';
  link: string = '';
}
export class Experience {
  sequence: number;
  institution_name: string = '';
  role: string = '';
  start_date: Date;
  end_date: Date;
  total_experience: string;
  currently_working_here: boolean
  description: string = '';
}
export class Preference {
  sequence: number;
  seeking_role: string = '';
  expected_salary: string;
  industry: string = '';
  working_remotely: boolean;
  relocate_preference: boolean;
}
export class Education {
  sequence: number;
  institution_name: string = '';
  degree: string = '';
  start_date: Date;
  end_date: Date;
  date_of_graduation: Date;
  currently_studying_here: boolean
}
export class AdditionalInfo {
  sequence: number;
  resume_link: string = '';
  resume_link_type: string = '';
  other_links: Docs[];
  about: string = '';
}
export class Goals {
  sequence: number;
  current_role: string = '';
  experience_level: string = '';
  desired_role: string = '';
  learning_goal: string = '';
}
export class Scholarship {
  sequence: number;
  name: string = '';
  city: string = '';
  dob: string = '';
  pincode: string = '';
  address: string = '';
  study_intended: string = '';
  gender: string;
}
export class BankDetails {
  beneficiary_name: string = '';
  bank_name: string = '';
  account_number: string = '';
  ifsc_code: string = '';
  gst_number: string = '';
  pan_number: string = '';
  gst_verified: boolean;
  pan_verified: boolean;
}
export class Skills{
  name: string;
  code: string;
}

export class UserProfile extends BaseModel {

  private static instance: UserProfile | null = null;

    // Static method to get the singleton instance
    public static getInstance(): UserProfile {
        if (this.instance === null) {
            this.instance = new UserProfile();
        }
        return this.instance;
    }

  constructor() {
    super('user_profiles');
    this.id = uuidv4();
    this.work_experience = [];
    this.work_preference = [];
    this.education_details = [];
    this.additional_info = [];
    this.goals = [];
    this.documents = [];
    this.scholarship_info = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  id: string = '';
  user_id: string = '';
  work_experience: Experience[];
  work_preference: Preference[];
  education_details: Education[];
  additional_info: AdditionalInfo[];
  goals: Goals[];
  scholarship_info: Scholarship[];
  documents: Docs[];
  bank_details: BankDetails;
  skills: Skills[]
  createdAt: Date;
  updatedAt: Date;
  created_by_id: string = '';
  updated_by_id: string = '';

  recent_viewed_course: Array;
  saved_jobs: Array;


  async createProfile(dbUrl, dbName, data: any) {
    const profile = new UserProfile();
    Object.assign(profile, data);
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(profile._collectionName).insertOne(profile);
    return profile;
  }

  private async fetchLatestData(dbUrl, dbName, query: any) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    const latestData = await db.collection(this._collectionName).findOne(query);
    if (latestData) {
      Object.assign(this, latestData);
    }
  }

  async addItem(dbUrl, dbName, query: any, data: { [key: string]: any }) {
    const arrayName = Object.keys(data)[0];
    const item = data[arrayName];
    await this.fetchLatestData(dbUrl, dbName, query);
    if (!this[arrayName]) {
      if (arrayName == "bank_details") {
        await this.updateProfile(dbUrl, dbName, query, { bank_details: item })
        return
      }else if (arrayName == "skills") {
        await this.updateProfile(dbUrl, dbName, query, { skills: item })
        return
      }else{
        throw new Error(`Array ${arrayName} does not exist on UserProfile`);
      }
    }
    const newItem = {
      ...item,
      sequence: this[arrayName].length + 1
    };
    this[arrayName].push(newItem);
    await this.saveToDatabase(dbUrl, dbName, query);
  }

  async updateItem(dbUrl, dbName, query: any, data: { [key: string]: any }, sequence: number) {
    const arrayName = Object.keys(data)[0];
    const updatedItem = data[arrayName];
    await this.fetchLatestData(dbUrl, dbName, query);
    if (!this[arrayName]) {
      throw new Error(`Array ${arrayName} does not exist on UserProfile`);
    }
    const index = this[arrayName].findIndex((item: any) => item.sequence === sequence);
    if (index !== -1) {
      this[arrayName][index] = { ...this[arrayName][index], ...updatedItem };
      await this.saveToDatabase(dbUrl, dbName,query);
    } else {
      throw new Error(`Item with sequence ${sequence} not found in ${arrayName}`);
    }
  }

  async deleteItem(dbUrl, dbName, query: any, data: { [key: string]: any }) {
    const arrayName = Object.keys(data)[0];
    const sequence = data[arrayName].sequence;
    await this.fetchLatestData(dbUrl, dbName, query);
    if (!this[arrayName]) {
      throw new Error(`Array ${arrayName} does not exist on UserProfile`);
    }
    const index = this[arrayName].findIndex((item: any) => item.sequence === sequence);
    if (index !== -1) {
      this[arrayName].splice(index, 1);
      this.reassignSequence(arrayName);
      await this.saveToDatabase(dbUrl, dbName, query);
    } else {
      throw new Error(`Item with sequence ${sequence} not found in ${arrayName}`);
    }
  }

  private reassignSequence(arrayName: string) {
    if (!this[arrayName]) {
      throw new Error(`Array ${arrayName} does not exist on UserProfile`);
    }
    this[arrayName].forEach((item: any, index: number) => {
      item.sequence = index + 1;
    });
  }

  private async saveToDatabase(dbUrl, dbName, query: any) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(this._collectionName).updateOne(
      query,
      { $set: this },
      { upsert: true }
    );
  }

  public async updateProfile(dbUrl, dbName, query, payload) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return db.collection(this._collectionName).findOneAndUpdate(
      query,
      {
        $set: payload,
      },
      { upsert: true }
    );
    // const result = await db.collection(this._collectionName).findOneAndUpdate(
    //   query,
    //   { $set: payload },
    //   { returnOriginal: false }
    // );
    // return result.value;
  }
}

