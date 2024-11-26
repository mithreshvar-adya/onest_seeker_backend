import { DatabaseConnection } from '@adya/shared';

export class OnestOndc {
    BAP_ID: string = "";
    BAP_URL: string = "";
    BAP_UNIQUE_KEY_ID: string = "";

    BAP_PRIVATE_KEY: string = "";
    BPP_PUBLIC_KEY: string = "";

    ENCRYPTION_PUBLIC_KEY: string = "";
    ENCRYPTION_PRIVATE_KEY: string = "";

    ONDC_PUBLIC_KEY: string = "";

    REGISTRY_BASE_URL: string = "";
    PROTOCOL_BASE_URL: string = "";
}

export class Redis {
    HOST: string = "";
    PORT: number = 0;
}

export class Kalfa {
    CLIENT_ID: string = "";
    BROKERS: string[] = [];
    SSL?: boolean;
    HOST: string = "";
    PORT: number = 0;
    GROUP_ID: string = "";
    MIN_BYTES: number = 0;
    MAX_BYTES: number = 0;
}

export class Global_Env {
    private static instance: Global_Env | null = null;
    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            return new Global_Env();
        }
        return this.instance;
    }

    APPLICATION: string = "";
    CODE: string = ""; 
    PORT: number = 0;
    MONGO_DB_URL: string = "";
    MONGO_DB_NAME?: string;
    DOMAIN?: string;
    COUNTRY?: string;
    JWT_SECRET?: string; 
    EXPIRY_TIME?: string; 
    ONDC_DETAILS?: OnestOndc;
    REDIS_CONFIGURATION?: Redis;
    KAFKA_CONFIGURATIONS?: Kalfa;
    COMMON_POSTGRESS_URL?: string;
    COURSE_REDIRECTION_URL?: string;
    JOB_REDIRECTION_URL?: string;
    SCHOLARSHIP_REDIRECTION_URL?: string;
    SUBSCRIPTION_REDIRECTION_URL?: string;
    AZURE_STORAGE_ACCOUNT_NAME?:string
    AZURE_TENANT_ID?: string
    AZURE_CLIENT_ID?:string
    AZURE_CLIENT_SECRET?:string 

    public async get(dbUrl: string, dbName: string, code: string): Promise<any> {
        try {
            const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
            const global_env = await db.collection('global_env').findOne({ CODE: code });
            if (global_env) {
                return global_env;
            }
            return null;
        } catch (err) {
            console.log("Error in Global Env", err);
            throw err;
        }
    }

    public async create(dbUrl:string, dbName:string, payload: any): Promise<void> {
        try {
            const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
            const existingData = await this.get(dbUrl, dbName, payload.code);
            if(existingData) {
                return;
            }
            await db.collection('global_env').insertOne(payload);
        } catch (err) {
            console.log("Error in Global Env", err);
            throw err;
        }
    }

    public async update(dbUrl:string, dbName:string, query: any, payload: any): Promise<void> {
        try {
            const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);

            await db.collection('global_env').findOneAndUpdate(query, {
                $set: payload
            })
        } catch (err) {
            console.log("Error in Global Env", err);
            throw err;
        }
    }
}
