import { PrismaClient } from '@prisma/client';

class PrismaClientManager {
  private static instances: { [key: string]: PrismaClient } = {};

  private constructor() {}

  public static getInstance(dbName: string, db_url:string): PrismaClient {
    if (!this.instances[dbName]) {
      
      this.instances[dbName] = new PrismaClient({
        datasources: {
          db: {
            url: db_url,
          },
        },
      });
    }

    return this.instances[dbName];
  }
}

export  {PrismaClientManager};
