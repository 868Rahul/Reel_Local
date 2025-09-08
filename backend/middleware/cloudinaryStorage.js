const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const rawStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reellocal/raw',
    resource_type: 'auto',
  },
});

const finalStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reellocal/final',
    resource_type: 'auto',
  },
});

const chatStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reellocal/chat',
    resource_type: 'auto',
  },
});

const revisionStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reellocal/revisions',
    resource_type: 'auto',
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'reellocal/profile',
    resource_type: 'image',
  },
});

module.exports = { rawStorage, finalStorage, chatStorage, revisionStorage, profileStorage }; 