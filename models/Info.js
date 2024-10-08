const monggose = require("mongoose");
const { ObjectId } = monggose.Schema;

const infoSchema = new monggose.Schema({
    infoName:{
        type : String,
        required: [true, "Please add a Info name!"],
    },
    type:{
        type : String,
        enum : ["Testimony","NearBy"], //jika tidak ada di enum, akan error
        required: [true, "Please add a Info type!"],
    },
    isHighlight:{
        type : Boolean,
        default : false  
    },
    description:{
        type : String,
        required: [true, "Please add a Description!"],
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

module.exports = monggose.model("Info", infoSchema)