import { S3Client } from '@aws-sdk/client-s3';
import { env } from './environment';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const config: ConstructorParameters<typeof S3Client>[0] = {
      region: env.AWS_REGION,
      credentials:
        env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    };

    if (env.AWS_S3_ENDPOINT) {
      config.endpoint = env.AWS_S3_ENDPOINT;
      config.forcePathStyle = true;
    }

    s3Client = new S3Client(config);
  }

  return s3Client;
}

export function getS3Bucket(): string {
  if (!env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }
  return env.AWS_S3_BUCKET;
}
