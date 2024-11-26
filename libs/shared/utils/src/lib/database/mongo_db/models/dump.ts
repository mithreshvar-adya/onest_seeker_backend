// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './base_model';

export class Dump extends BaseModel {

    private static instance: Dump | null = null;

    // Static method to get the singleton instance
    public static getInstance(): Dump {
        if (this.instance === null) {
            this.instance = new Dump();
        }
        return this.instance;
    }

    constructor() {
        super('dump');
        this.id = uuidv4(); // Assign a UUID by default
    }

    id: string;
    data: object
}
