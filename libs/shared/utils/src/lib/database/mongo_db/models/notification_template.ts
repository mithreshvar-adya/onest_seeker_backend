// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


export class NotificationTemplate extends BaseModel{

    private static instance: NotificationTemplate | null = null;

    // Static method to get the singleton instance
    public static getInstance(): NotificationTemplate {
      if (this.instance === null) {
          this.instance = new NotificationTemplate();
      }
      return this.instance;
  }

  constructor() {
    super('notification_template');
    this.id = uuidv4();
    this.is_active = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

 
  id: string;
  template_category: string; // title
  subject: string;
  description: string;
  sms_description: string;
  user_type_id: number;
  user_type: string;
  message_type: string; // email or sms or both
  sms_template_id: string;
  email_template_id: string;
  created_by_id: number;
  created_by: string;
  updated_by_id: number;
  updated_by: string;
  company_id: number;
  company_details: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;

  public async createNotificationTemplate(dbUrl, dbName, data: any) {
    const notification_template = new NotificationTemplate();
    Object.assign(notification_template, data);
    const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
    await db.collection(notification_template._collectionName).insertOne(notification_template);
    return notification_template.id;
}
}
