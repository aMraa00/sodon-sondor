const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'xray' ? 'uploads/xrays' : 'uploads/avatars';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new ApiError(400, 'Зөвхөн зураг (jpeg, jpg, png, webp) файл зөвшөөрнө.'));
};

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
