import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

interface UploadToCloudinaryInput {
  file: string;
  folder?: string;
  publicId?: string;
  resourceType?: UploadApiOptions['resource_type'];
  overwrite?: boolean;
}

let cloudinaryConfigured = false;

function ensureCloudinaryConfig(): void {
  const missingKeys = [
    ['CLOUDINARY_CLOUD_NAME', env.cloudinaryCloudName],
    ['CLOUDINARY_API_KEY', env.cloudinaryApiKey],
    ['CLOUDINARY_API_SECRET', env.cloudinaryApiSecret],
  ].filter(([, value]) => !value);

  if (missingKeys.length) {
    const keys = missingKeys.map(([key]) => key).join(', ');
    throw new Error(`Missing cloudinary configuration: ${keys}`);
  }
}

function ensureCloudinaryInitialized(): void {
  if (cloudinaryConfigured) return;

  ensureCloudinaryConfig();
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
  cloudinaryConfigured = true;
}

export async function uploadToCloudinary({
  file,
  folder = env.cloudinaryFolder,
  publicId,
  resourceType = 'image',
  overwrite = true,
}: UploadToCloudinaryInput): Promise<UploadApiResponse> {
  ensureCloudinaryInitialized();
  return cloudinary.uploader.upload(file, {
    folder,
    public_id: publicId,
    resource_type: resourceType,
    overwrite,
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: UploadApiOptions['resource_type'] = 'image',
): Promise<{ result: string }> {
  ensureCloudinaryInitialized();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
