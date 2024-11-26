import { ObjectId } from 'mongodb';
import { DatabaseConnection } from '@adya/shared';
import { BuyerAppConfig } from '@adya/shared';
import * as config from 'config';

const appConfig: BuyerAppConfig = config.get('seeker.backend_application');

export async function getLookupCodeName(lookupCodeID: string): Promise<string> {
  try {
    const { db } = await DatabaseConnection.getInstance(
      appConfig.MONGO_DB_URL, appConfig.MONGO_DB_NAME
    );

    const lookupCodeRecord = await db.collection('lookup_code').findOne({
      _id: new ObjectId(lookupCodeID),
    });

    if (!lookupCodeRecord) {
      throw new Error('Lookup not found');
    }

    return lookupCodeRecord['lookup_code'];
  } catch (error: any) {
    console.error('Error:', error.message);
    throw new Error('Lookup not found');
  }
}
