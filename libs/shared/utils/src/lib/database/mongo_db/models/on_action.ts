// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';
import { DatabaseConnection } from '@adya/shared';


export class OnActions extends BaseModel {

    private static instance: OnActions | null = null;

    // Static method to get the singleton instance
    public static getInstance(): OnActions {
        if (this.instance === null) {
            this.instance = new OnActions();
        }
        return this.instance;
    }

    constructor() {
        super('on_actions');
        this.id = uuidv4(); // Assign a UUID by default
    }

    id: string
    transaction_id: String 
    message_id: String 
    action: String
    response: Object
    createdAt = new Date()
    updatedAt = new Date()

    public async createOnAction(dbUrl, dbName, data: any) {
        const on_action = new OnActions();
        Object.assign(on_action, data);
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);        
        await db.collection(on_action._collectionName).insertOne(on_action);
        return on_action;
    }

    async deleteOnAction(dbUrl, dbName, query){
        const { db } = await DatabaseConnection.getInstance(dbUrl, dbName);
        const collection = db.collection('on_actions');
        await collection.deleteMany(query);
        return "deleted"
    }

}