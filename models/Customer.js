const monggose = require("mongoose");
const validator = require("validator");

const customerSchema = new monggose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: [true, "Please add a first name!"],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, "Please add a last name!"],
  },
  email: {
    type: String,
    trim: true,
    //unique: true, //sementara di matikan
    required: [true, "Please add an email!"],
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Please add a valid email!");
      }
    },
  },
  phoneNumber: {
    type: String,
    required: [true, "Please add a phone number!"],
  },
});

module.exports = monggose.model("Customer", customerSchema);
