const multer = require("multer");
const path = require("path");
const fs = require("fs");

// set storage enggine
const storage = multer.diskStorage({
    destination : "public/images", //letak file upload
    filename : function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // penamana file upload tgl sekarang+random caracter
    },
})

const uploadSingle = multer({ // function jika file hanya 1
    storage : storage,
    // limits : { fileSize : 1000000 }, //batas ukuran file 1mb
    fileFilter : function (req, file, cb) { //filter file type yg bisa di upload
        checkFileType(file, cb);
    }
}).single("image"); // mengunakan set up dari multer , atau bawaan dari multer

const storageMultiple = multer.diskStorage({ // function jika file lebih dari 1
    destination: function (req, file, cb) { 
      var dir = "public/images";    //letak file upload
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
   });
   
   const uploadMultiple = multer({
    storage: storageMultiple,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
   }).array("image"); // mengunakan set up dari multer , atau bawaan dari multer

// check file type
function checkFileType(file, cb){

    // allowed ext
    const fileTypes = /jpeg|jpg|png|gif/; //file type yg di perbolehkan untuk upload

    // check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());

    // check mime
    const mimeType = fileTypes.test(file.mimetype);

    if(mimeType && extname){
        return cb(null, true)
    }else{
        cb("Error: Images Only!")
    }
}

module.exports = {uploadSingle, uploadMultiple}