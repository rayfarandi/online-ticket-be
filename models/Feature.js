const monggose = require("mongoose");
const { ObjectId } = monggose.Schema;

const featureSchema = new monggose.Schema({
    featureName:{
        type : String,
        required: [true, "Please add a Feature name!"],
    },
    qty:{
        type : Number,
        required: [true, "Please add a Feature Quantity!"],
    },
    imageUrl:{
        type : String,
        required: true,
    },
    item:[{
        type : ObjectId,
        ref:"Item",
    }]
})

module.exports = monggose.model("Feature", featureSchema)