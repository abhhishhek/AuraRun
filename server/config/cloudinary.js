import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const missingCloudinaryEnv = !process.env.CLOUDINARY_CLOUD_NAME
  || !process.env.CLOUDINARY_API_KEY
  || !process.env.CLOUDINARY_API_SECRET;

if (missingCloudinaryEnv) {
  // eslint-disable-next-line no-console
  console.warn('[cloudinary] Missing CLOUDINARY_* env vars. Uploads will fail until they are set.');
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce',
    resource_type: 'image',
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith('image/')) return cb(null, true);
  return cb(new Error('Only image files are allowed'));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
});
export default cloudinary;
