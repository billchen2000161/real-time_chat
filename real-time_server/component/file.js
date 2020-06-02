let path = require('path');
let multer = require('multer'),
    storage = multer.diskStorage({
        destination: function (req, file, next) {
            next(null, './public/file')
        },
        filename: function (req, file, next) {
            console.log(file.originalname);
            next(null, file.originalname)
        }
    })
let upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        let ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.txt') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true);
    },
    limits: {
        fileSize: 1024 * 1024
    }
})
let save = upload.single('file');
module.exports = {
    save
}