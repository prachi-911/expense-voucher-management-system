const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/signatures');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `sig-${uniqueSuffix}${ext || '.png'}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: fileFilter
});

// Helper to save base64 data URL to an image file
const saveBase64Image = (base64String, prefix = 'sig') => {
  if (!base64String) return null;
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // If it's already a URL/path, return as is
    if (base64String.startsWith('/uploads/') || base64String.startsWith('http')) {
      return base64String;
    }
    return null;
  }

  const mime = matches[1];
  let ext = '.png';
  if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
  else if (mime.includes('webp')) ext = '.webp';

  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/signatures/${filename}`;
};

module.exports = {
  upload,
  saveBase64Image
};
