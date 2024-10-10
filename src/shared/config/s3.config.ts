import { registerAs } from '@nestjs/config';

export default registerAs('s3Config', () => {
  return {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET,
    rootFolder: process.env.S3_FOLDER || '',
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || undefined,
  };
});
