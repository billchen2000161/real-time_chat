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
let upload = multer({ storage: storage })
let save = upload.single('file');
module.exports = {
    save
}