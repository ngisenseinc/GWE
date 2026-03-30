import { compressImage } from '../utils/imageUtils';

// Default Cloudinary folder where all uploads should go (read from frontend env if available)
const DEFAULT_CLOUDINARY_FOLDER: string = (typeof window !== 'undefined' && ((import.meta as any).env?.VITE_CLOUDINARY_TARGET_FOLDER))
  ? ((import.meta as any).env.VITE_CLOUDINARY_TARGET_FOLDER as string)
  : 'ce861f422e0915cd14c0225345d0b8b4ce';

// Cloudinary-based image uploader (client-side unsigned upload)
export const uploadImageToStorage = async (file: File, folderName: string = DEFAULT_CLOUDINARY_FOLDER): Promise<string> => {
  try {
    // Compress the image before upload
    const compressedBlob = await compressImage(file, 1200, 1200, 0.85);

    // Build a unique public_id for Cloudinary
    const timestamp = Date.now();
    const extension = (file.name?.split('.').pop()) || 'jpg';
    const uniqueFilename = `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
    const publicId = `${folderName}/${uniqueFilename}`;

    // Request a server-signed upload from our backend
    const signRes = await fetch('/api/storage/sign-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId, folder: folderName })
    });
    if (!signRes.ok) {
      const err = await signRes.text();
      throw new Error(`Signing failed: ${err}`);
    }
    const signData = await signRes.json();
    const { signature, timestamp: ts, api_key, cloud_name } = signData;

    // Prepare form data for Cloudinary signed upload
    const form = new FormData();
    let fileForUpload: any = compressedBlob;
    try {
      fileForUpload = new File([compressedBlob], `upload_${Date.now()}.jpg`, { type: 'image/jpeg' });
    } catch {
      // Fallback to blob if File constructor not supported
      fileForUpload = compressedBlob;
    }
    form.append('file', fileForUpload);
    form.append('public_id', publicId);
    form.append('folder', folderName);
    form.append('timestamp', String(ts));
    form.append('signature', signature);
    form.append('api_key', api_key);

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
      method: 'POST',
      body: form
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Cloudinary upload failed: ${msg}`);
    }

    const data = await response.json();
    return data.secure_url as string;
  } catch (error: any) {
    console.error('Error uploading to Cloudinary Storage:', error?.message ?? error);
    throw error;
  }
};
