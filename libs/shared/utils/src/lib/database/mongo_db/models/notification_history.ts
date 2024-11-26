// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


export class NotificationHistory extends BaseModel{

  private static instance: NotificationHistory | null = null;


  // Static method to get the singleton instance
  public static getInstance(): NotificationHistory {
    if (this.instance === null) {
        this.instance = new NotificationHistory();
    }
    return this.instance;
}

  constructor() {
    super('notification_history');
    this.id = uuidv4();
    this.read_message = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  id: string;
  message: string;
  user_id: number;
  user_details: object;
  read_message: boolean;
  subject: string;
  createdAt: Date;
  updatedAt: Date;

  public async createNotificationHistory(dbUrl, dbName, data: any) {
    const notification_history = new NotificationHistory();
    Object.assign(notification_history, data);
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(notification_history._collectionName).insertOne(notification_history);
    return notification_history.id;
}

}
