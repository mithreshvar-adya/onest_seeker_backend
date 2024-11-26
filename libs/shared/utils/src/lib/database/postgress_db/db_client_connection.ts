import {PrismaClientManager,SellerAppConfig} from '@adya/shared';
import { PrismaClient } from '@prisma/client';


export function getDBConnections(db_name:string, postgres_url:string):PrismaClient {
    return PrismaClientManager.getInstance(db_name,postgres_url)
}

export enum DBNAMES {
  "COMMON_POSTGRESS_URL" = "COMMON_POSTGRESS_URL"
}