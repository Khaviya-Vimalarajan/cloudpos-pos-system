const cloudinary = require('cloudinary').v2;

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

if (!cloudName || !apiKey || !apiSecret) {
  console.error('[Cloudinary Config Error]: Missing required environment variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET. Please ensure your .env file is loaded.');
}

// Configure Cloudinary using trimmed environmental variables
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

/**
 * Upload a base64 encoded image string to Cloudinary
 * @param {string} base64Str - base64 source string (e.g. data:image/png;base64,...)
 * @param {string} folder - Target folder name on Cloudinary
 * @returns {Promise<string>} - Secure HTTPS URL of the uploaded image
 */
const uploadToCloudinary = async (base64Str, folder = 'cloudpos') => {
  if (!base64Str || !base64Str.startsWith('data:image')) {
    // Return unchanged if it is already an HTTPS link or empty
    return base64Str;
  }
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration error: Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET in the environment variables (.env file).');
  }
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Str, {
      folder: folder,
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('[Cloudinary Helper Error]:', error);
    throw new Error(`Image upload to Cloudinary failed: ${error.message || error}`);
  }
};

module.exports = uploadToCloudinary;
