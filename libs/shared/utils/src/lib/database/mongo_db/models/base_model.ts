// @ts-nocheck
import { DatabaseConnection } from '@adya/shared';

export class BaseModel {

  public static collectionName;
  public _collectionName;
  constructor(collectionName: string) {
    this._collectionName = collectionName;
  }

  public async findOne(dbUrl, dbName, filters = {}) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return db.collection(this._collectionName).findOne(filters);
  }

  public async findOneWithProjection(dbUrl, dbName, filters = {}, select_fields: any,) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return db.collection(this._collectionName).findOne(filters, { projection: select_fields });
  }

  public async findAll(dbUrl, dbName, filters = {}) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return db.collection(this._collectionName).find(filters).toArray();
  }

  public async findAllWithProjection(dbUrl, dbName, filters = {}, select_fields: any, sort: any) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return db.collection(this._collectionName).find(filters, { projection: select_fields }).sort(sort).toArray();
  }
  
  public async paginate(dbUrl, dbName, page: any = '1', limit: any = 10, filters = {}, select_fields, sort: any) {
    console.log("MONGO_DB_URL, MONGO_DB_NAME",dbUrl, dbName);

    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    const count = await db
      .collection(this._collectionName)
      .countDocuments(filters);

    // const data = await db
    //   .collection(this._collectionName)
    //   .find(filters, { projection: select_fields })
    //   .sort(sort)
    //   .skip((parseInt(page) - 1) * parseInt(limit))
    //   .limit(parseInt(limit))
    //   .toArray();
    // const total_pages = Math.ceil(count / limit);
    
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
    const total_pages = limit === -1 ? 1 : Math.ceil(count / limit);
    let object = {}
    object["data"] = data;
    object["pagination"] = {};
    object["pagination"]["per_page"] = limit === -1 ? count : limit;
    object["pagination"]["page_no"] = page;
    object["pagination"]["total_rows"] = count;
    object["pagination"]["total_pages"] = total_pages
    return { data: data, pagination: object.pagination };
  }

  public async update(dbUrl, dbName, query, payload) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return db.collection(this._collectionName).findOneAndUpdate(
      query,
      {
        $set: payload,
      },
      { upsert: true }
    );
  }

  public async updateMany(dbUrl, dbName, query, payload) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    return db.collection(this._collectionName).updateMany(
      query,
      {
        $set: payload,
      },
      { upsert: false }
    );
  }

  public async save(dbUrl, dbName) {
    const collectionName = this._collectionName;
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    delete this._collectionName;
    return db.collection(collectionName).insertOne(this);
  }

  public async create(dbUrl, dbName, data: any) {
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(this._collectionName).insertOne(data);
  }

}
