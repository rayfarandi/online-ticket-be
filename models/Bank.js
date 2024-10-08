const monggose = require("mongoose");

const bankSchema = new monggose.Schema({
    bankName:{
        type : String,
        trim : true,
        required: [true, "Please add a bank name!"],
    },
    accountNumber:{
        type : String,
        required: [true, "Please add a Account number!"],
    },
    accountHolder:{
        type : String,
        required: [true, "Please add a Account holder!"],
    },
    imageUrl:{
        type : String,
        required: true
        
    },
})

module.exports = monggose.model("Bank", bankSchema)