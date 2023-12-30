import multer from "multer"
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log(4567345)
      cb(null, "./public")
    },
    filename: function (req, file, cb) {
      return cb(null,` ${Date.now()} + '-' + ${file.originalname}`)
    }
  });
export const upload = multer({ storage: storage })