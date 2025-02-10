import { execSync } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export default async function uploadReminders(reminders = []) {
    try {
        const client = new S3Client({
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            }
        });

        await client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: process.env.S3_PATH || 'reminders.json',
            Body: JSON.stringify(reminders, null, 2),
            ContentType: 'application/json'
        }));

        console.log('Successfully uploaded reminders to S3');
    } catch (err) {
        console.error('Error:', err);
    }
}