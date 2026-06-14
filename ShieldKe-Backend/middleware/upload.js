const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1E9)
      + path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/JPG/PNG files allowed"), false);
  }

};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter
});

module.exports = upload;