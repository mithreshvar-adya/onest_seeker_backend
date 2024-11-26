import { LookupCode, Global_Env, global_env } from '@adya/shared';
import { createUpdateDeleteSelectedFields, GetLookupCode } from './dto';

const course_model = LookupCode.getInstance();
const env_model = Global_Env.getInstance();

class Service {
  private static instance: Service | null = null;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Static method to get the singleton instance
  public static getInstance(): Service {
    if (this.instance === null) {
      this.instance = new Service();
    }
    return this.instance;
  }

  async createLookupCode(payload) {
    try {
      await course_model.createlook(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, payload);
      return {};
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }
  async get(query: any): Promise<any> {
    try {
      const select_fields = GetLookupCode;
      const resp = await course_model.readUser(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, select_fields);
      return resp;
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async list(
    query: any,
    page_no: number,
    per_page: number,
    sort: any
  ): Promise<any> {
    try {
      const select_fields = GetLookupCode;
      const response = await course_model.paginate(
        global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME,
        page_no,
        per_page,
        query,
        select_fields,
        sort
      );
      return response;
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async update(query: any, payload: any): Promise<any> {
    try {
      await course_model.updateUser(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload);
      return {};
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async delete(query: any): Promise<any> {
    try {
      await course_model.deleteUser(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query);
      return {};
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async getEnv(query) {
    try {
      return await env_model.get(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query);
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async createEnv(payload) {
    try {
      await env_model.create(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, payload);
      return {};
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }

  async updateEnv(query, payload) {
    try {
      await env_model.update(global_env.MONGO_DB_URL, global_env.MONGO_DB_NAME, query, payload);
      return {};
    } catch (err) {
      console.log('Service Error =====', err);
      throw err;
    }
  }
}

export default Service;