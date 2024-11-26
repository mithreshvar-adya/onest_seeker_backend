export function shared(): string {
  return 'shared';
}


export interface SellerAppConfig {
  PORT: number;
  MONGO_DB_URL: string;
  REDIS_CONFIGURATION: {
    HOST: string;
    PORT: number;
  }
  KAFKA_CONFIGURATIONS: {
    CLIENT_ID: string;
    BROKERS: string[];
    SSL: boolean;
    HOST: string;
    PORT: number;
    GROUP_ID: string;
    MIN_BYTES: number;
    MAX_BYTES: number
  };
  ONDC_DETAILS: {
    BAP_ID: string;
    BAP_URL: string;
    BAP_UNIQUE_KEY_ID: string;
    BAP_PRIVATE_KEY: string;

    PROTEAN_ENCRYPTION_PRIVATE_KEY: string;
    ONDC_PUBLIC_KEY: string;

    REGISTRY_BASE_URL: string;
    PROTOCOL_BASE_URL: string;
  };
  COMMON_POSTGRESS_URL: string;
  FASHION_POSTGRESS_URL: string;
  FOOD_AND_BEVERAGES_POSTGRESS_URL: string;
  GROCERY_POSTGRESS_URL: string;
  BPC_POSTGRESS_URL: string;
  ELECTRONICS_POSTGRESS_URL: string;
  HOME_AND_DECOR_POSTGRESS_URL: string;
  HEALTH_AND_WELLNESS_POSTGRESS_URL: string;
  ELASTIC_SEARCH_URL: String;
  ELASTIC_SEARCH_USERNAME: String;
  ELASTIC_SEARCH_PASSWORD: String;
}

export interface KakaConfig {
  CLIENT_ID: string;
  BROKERS: string[];
  SSL: boolean;
  HOST: string;
  PORT: number;
  GROUP_ID: string;
  MIN_BYTES: number;
  MAX_BYTES: number
}
export interface RedisConfig {
  HOST: string;
  PORT: number;
}
export interface OnestOndcConfig {
  BAP_ID: string;
  BAP_URL: string;
  BAP_UNIQUE_KEY_ID: string;

  BAP_PRIVATE_KEY: string;
  BPP_PUBLIC_KEY: string;

  ENCRYPTION_PUBLIC_KEY: string;
  ENCRYPTION_PRIVATE_KEY: string;

  ONDC_PUBLIC_KEY: string;

  REGISTRY_BASE_URL: string;
  PROTOCOL_BASE_URL: string;
}

export interface BuyerAppConfig {
  EXPIRY_TIME: any;
  JWT_SECRET: string;
  ONDC_DETAILS: OnestOndcConfig;
  REDIS_CONFIGURATION: RedisConfig
  KAFKA_CONFIGURATIONS: KakaConfig;
  PORT: number;
  MONGO_DB_URL: string;
  MONGO_DB_NAME: string;
  DOMAIN: string;
  COUNTRY: string;
  COMMON_PROTOCOL_URL: string;
  FILE_UPLOAD: FileUploadConfig
}

export interface OnestNetworkRouterConfig {
  PORT: number;
  COURSE_REDIRECTION_URL:string
  JOB_REDIRECTION_URL:string
  SCHOLARSHIP_REDIRECTION_URL:string
  SUBSCRIPTION_REDIRECTION_URL:string
}

export interface FileUploadConfig{
  PORT: number;
  AZURE_STORAGE_ACCOUNT_NAME:string;
  AZURE_TENANT_ID:string;
  AZURE_CLIENT_ID:string;
  AZURE_CLIENT_SECRET:string;
}