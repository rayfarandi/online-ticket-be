const monggose = require("mongoose");
const { ObjectId } = monggose.Schema;

const itemSchema = new monggose.Schema({
    itemName:{
        type : String,
        required: [true, "Please add a Item name!"],
    },
    itemPrice:{
        type : Number,
        required: [true, "Please add a Item Price!"],
    },
    unit:{
        type : String,
        required: [true, "Please add a Item unit!"],
    },
    sumBooked:{
        type : Number,
        default : 0
    },
    location:{
        type : String,
        required: [true, "Please add a Item location!"],
    },
    isPopular:{
        type : Boolean,
        default : false
    },
    description:{
        type : String,
        required: [true, "Please add a Description!"],
    },

    category:{
        type : ObjectId,
        ref:"Category",
    },
    image:[{
        type : ObjectId,
        ref:"Image",
    }],
    feature:[{
        type : ObjectId,
        ref:"Feature",
    }],
    info:[{ //untuk relasi antar collection
        type : ObjectId,
        ref:"Info",
    }],

})

module.exports = monggose.model("Item", itemSchema)