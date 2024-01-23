const cloudinary = require('cloudinary').v2;// Require the cloudinary library
const generateRandomString = require('../utils/randomId')
require('dotenv').config();
// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer) => {

    const randomId = generateRandomString(8)
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
            resource_type: 'image',
            public_id: `TweetX/post_images/${randomId}`
       
    },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  };


  const deleteFromCloudinary = async(file) => {

    cloudinary.v2.uploader
    .destroy(file)
    .then(result=>console.log(result));

  }
  
  module.exports = {uploadToCloudinary,deleteFromCloudinary} ;
