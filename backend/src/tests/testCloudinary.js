const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const cloudinary = require('cloudinary').v2;

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

console.log('Testing Cloudinary SDK upload...');
console.log('Cloud Name:', cloudName);
console.log('API Key:', apiKey);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

const testUpload = async () => {
  const base64Str = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  try {
    const res = await cloudinary.uploader.upload(base64Str, {
      folder: 'test_folder'
    });
    console.log('\n🎉 SUCCESS! Image uploaded successfully.');
    console.log('Delivery URL:', res.secure_url);
  } catch (error) {
    console.error('\n❌ Upload failed with error:', error);
  }
};

testUpload();
