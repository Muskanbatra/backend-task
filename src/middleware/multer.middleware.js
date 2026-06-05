const multer = require("multer");

const upload = multer({
    limits: 50000,
    storage: multer.diskStorage({})
});

module.exports = upload