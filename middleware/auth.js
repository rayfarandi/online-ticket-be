const User = require("../models/User");
const jwt = require("jsonwebtoken");

//env
require("dotenv").config({ path: "./.env" });

//Authorization middleware
const auth = async (req, res, next) => {
  try {
    //console.log(req); //for testing
    //console.log(req.header("Authorization")); //for testing

    if (!req.header("Authorization")) {
      //jika token tidak ada
      throw new Error("Authorization Not Found");
    }
    const token = await req.header("Authorization").replace("Bearer ", ""); //menghilangkan bearer
    const decode = jwt.verify(token, process.env.APP_SECRET); //verifikasi token, mengecek apakah token valid, menggunakan secret dan menampung ke decode
    const user = await User.findOne({
      _id: decode._id,
      "tokens.token": token,
    }); //mencari data token dari user

    if (!user) { //jika user tidak ditemukan
      throw new Error("Invalid User Token");
    }

    req.user = user; //mengirimkan data user, jika di perlukan 
    req.user.token = token; //mengirimkan token
    next(); //melanjutkan
  } catch (error) { //jika ada error
    res.status(401).send({ error: error.message });
  }
};

module.exports = auth;
