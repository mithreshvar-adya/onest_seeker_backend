// @ts-nocheck
import { Expose } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';

export class Assign_Module {
  id: number;
  module_id: string; 
  module_name: string
  is_view: boolean;
  is_edit: boolean;
  is_delete: boolean;
}

export class Role extends BaseModel{

  private static instance: Role | null = null;

  // Static method to get the singleton instance
  public static getInstance(): Role {
    if (this.instance === null) {
        this.instance = new Role();
    }
    return this.instance;
  }

  constructor() {
    super('role');
    this.id = uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  id: string;
  name: string; // unique
  code: string; // unique
  description: string;
  // role_assign_module: Assign_Module[];
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  company_id: string;
  created_by_id: string;
  updated_by_id: string;

  async create(dbUrl:any, dbName:any, select:any, payload:any) {
    try {
      const role = new Role();
      Object.assign(role, payload);
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      await db.collection(role._collectionName).insertOne(role);
      return role;
    } catch (err) {
      console.log("DB Error in create ==========>>>", err)
      throw err
    }
  }

  async get(dbUrl:any, dbName:any, select:any, query:any) {
    try {
      const role = new Role();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      return await db.collection(role._collectionName).findOne(query, {
        projection: select
      });
    } catch (err) {
      console.log("DB Error in get ==========>>>", err)
      throw err

    }
  }

  async getAll(dbUrl:any, dbName:any, select:any, query:any, skip:any = 0, take:any = 10, orderBy:any = {}) {
    try {
      const role = new Role();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
  
      return await db.collection(role._collectionName)
        .find(query, { projection: select })
        .toArray();
    } catch (err) {
        console.log("DB Error in getAll ==========>>>", err)
        throw err
    }
  }

  async get_pagination(dbUrl: any, dbName: any, page_no: any = 1, per_page: any = 10, query: any = {}, select_fields: any) 
  {
    const role = new Role();
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
  
    const collection = db.collection(role._collectionName);
  
    const total_record = await collection.countDocuments(query);
  
    if (per_page === -1) {
      // Fetch all data
      const data = await collection
        .aggregate([
          { $match: query },
          {
            $lookup: {
              from: 'role_permission',
              localField: 'id',
              foreignField: 'role_id',
              as: 'role_assign_module',
            },
          },
          {
            $project: {
              ...select_fields,
              role_assign_module: {
                $map: {
                  input: '$role_assign_module',
                  as: 'module',
                  in: {
                    _id: '$$module._id',
                    module_id: '$$module.module_id',
                    module_name: '$$module.module_name',
                    is_view: '$$module.is_view',
                    is_edit: '$$module.is_edit',
                    is_delete: '$$module.is_delete',
                  },
                },
              },
            },
          },
        ])
        .toArray();
      const pagination = {
        per_page: total_record,
        page_no: 1,
        total_rows: total_record,
        total_pages: 1,
        data: data,
      };

      return pagination;
    } else {
      const skip_record = (page_no - 1) * per_page;
  
      const data = await collection
        .aggregate([
          { $match: query },
          {
            $lookup: {
              from: 'role_permission',
              localField: 'id',
              foreignField: 'role_id',
              as: 'role_assign_module',
            },
          },
          {
            $project: {
              ...select_fields,
              role_assign_module: {
                $map: {
                  input: '$role_assign_module',
                  as: 'module',
                  in: {
                    _id: '$$module._id',
                    module_id: '$$module.module_id',
                    module_name: '$$module.module_name',
                    is_view: '$$module.is_view',
                    is_edit: '$$module.is_edit',
                    is_delete: '$$module.is_delete',
                    // Add more fields if needed
                  },
                },
              },
            },
          },
        ])
        .skip(skip_record)
        .limit(per_page)
        .toArray();
  
      const total_pages = Math.ceil(total_record / per_page);
  
      const pagination = {
        per_page: per_page,
        page_no: page_no,
        total_rows: total_record,
        total_pages: total_pages,
        data: data,
      };
  
      return pagination;
    }
  }

  async update(dbUrl:any, dbName:any, select:any, query:any, payload:any) {
    try {
      const role = new Role();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      return db.collection(this._collectionName).findOneAndUpdate(
        query,
        {
          $set: payload,
        },
        { upsert: true }
      );
    } catch (err) {
        console.log("DB Error in update ==========>>>", err)
        throw err
    }
  }

  async delete(dbUrl:any, dbName:any, select:any, query:any) {
    try {
      const role = new Role();
      const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
      return await db.collection(role._collectionName).deleteOne(query);
    } catch (err) {
      console.log("DB Error in delete ==========>>>", err)
      throw err
    }
  }

  public async findWithRole(dbUrl:any, dbName:any, filter = {}, select_fields:any) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return await db
      .collection(this._collectionName)
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'role_permission',
            localField: 'id', // Field in the 'role' collection
            foreignField: 'role_id', // Field in the 'role_permission' collection
            as: 'role_assign_module', // Name for the joined field
          },
        },
        {
          $project: {
            ...select_fields,
            role_assign_module: {
              $map: {
                input: '$role_assign_module',
                as: 'module',
                in: {
                  id: '$$module.id',
                  role_id: '$$module.role_id',
                  module_id: '$$module.module_id',
                  module_name: '$$module.module_name',
                  is_view: '$$module.is_view',
                  is_edit: '$$module.is_edit',
                  is_delete: '$$module.is_delete',
                  company_id: '$$module.company_id'
                },
              },
            }
          }
        },
        // {
        //   $unwind: {
        //     path: '$role_assign_module',
        //     preserveNullAndEmptyArrays: true,
        //   },
        // },
      ])
     .toArray();
  }

}
