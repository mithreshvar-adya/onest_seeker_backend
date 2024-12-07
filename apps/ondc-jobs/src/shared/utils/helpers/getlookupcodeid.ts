import { ObjectId } from 'mongodb';
import { DatabaseConnection } from '@adya/shared';
import { GlobalEnv } from '../../../config/env';

export async function getLookupCodeId(lookupType: string, lookupCode: string): Promise<string> {
  lookupType = lookupType.toUpperCase();
  lookupCode = lookupCode.toUpperCase();

  try {
    const { db } = await DatabaseConnection.getInstance(
      GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME
    );

    const lookupCodeRecord = await db.collection('lookup_code').findOne({
      lookup_type: lookupType,
      lookup_code: lookupCode,
    });

    if (!lookupCodeRecord) {
      throw new Error(`Lookup code not found: ${lookupType} - ${lookupCode}`);
    }

    return lookupCodeRecord.id.toString();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      throw new Error('Lookup not found');
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred');
    }
  }
}
