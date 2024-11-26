import { Db, MongoClient } from 'mongodb';

export class DatabaseConnection {
  private static instance: {
    client: MongoClient;
    db: Db;
  };

  public static async getInstance(url:string, db_name:string) {
    if (!DatabaseConnection.instance) {
      try {
        const client = new MongoClient(url);
        await client.connect();
        const db = client.db(db_name);
        DatabaseConnection.instance = { client, db };
      } catch (error) {
        console.log(error);
      }
    }
    return DatabaseConnection.instance;
  }
}
