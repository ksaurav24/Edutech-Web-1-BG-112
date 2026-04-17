import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export async function uploadImage(dataUrl: string, folder: string): Promise<string> {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new Error('Cloudinary credentials are not configured');
  }
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}
