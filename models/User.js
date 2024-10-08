const monggose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//env
require("dotenv").config({ path: "./.env" });

const userSchema = new monggose.Schema(
  {
    userName: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please add a user name!"],
    },
    email: {
      type: String,
      required: [true, "Please add an email!"],
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw Error("Please add a valid email!");
        }
      },
    },
    role: {
      type: String,
      enum: ["admin", "owner"],
      default: "owner",
    },
    password: {
      type: String,
      required: [true, "Please add a password!"],
      minlength: 7, //minimun char password
      trim: true, //menghilangkan spasi
    },
    passwordConfirm: {
      type: String,
      minlength: 7, //minimun char password
      trim: true, //menghilangkan spasi
      required: [true, "Please add a password confirm!"],
      validate(value) {
        if (this.password !== this.passwordConfirm) {
          return true;
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

//Generate token {function custom}
userSchema.methods.generateAuthToken = async function () {
  //mengembalikan token
  const user = this; //this = userSchema itu sendiri
  const token = jwt.sign({ _id: user._id.toString() }, process.env.APP_SECRET, {
    //mengenerate token, embed _id {dengan id user}
    expiresIn: "1 days", // waktu berdasarkan bahasa english
  });

  user.tokens = user.tokens.concat({ token }); //melakukan concanate dari hasil genereate token ke tokens
  await user.save();
  return token; //mengembalikan token untuk dipakai frontend
};

//custom json convert
userSchema.methods.toJSON = function () {
  //menghilangkan password, passwordConfirm, token. saat read/view data user
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.passwordConfirm;
  delete userObject.tokens;
  return userObject;
};

//login cek {function custom}
userSchema.statics.findByCredentials = async (email, password) => {
  //mengambil email dan password
  const user = await User.findOne({ email }); //mencari data email, untuk login mengunakan email bukan dengan username
  if (!user) {
    //jika tidak ditemukan
    throw Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password); //mencocokan password
  if (!isMatch) {
    //jika tidak cocok
    throw Error("Wrong Password");
  }
  return user;
};

//hashing password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  if (user.isModified("passwordConfirm")) {
    user.passwordConfirm = await bcrypt.hash(user.passwordConfirm, 8);
  }
  next();
});

const User = monggose.model("User", userSchema); //membuat model agar dapat dipakai di file itu sendiri yg memerlukan model user
module.exports = User; // {di gunakan di findByCredentials}
