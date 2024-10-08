const monggose = require("mongoose");
const { ObjectId } = monggose.Schema;

const categorySchema = new monggose.Schema({
    categoryName:{
        type : String,
        unique : true,
        required: [true, "Please add a category name!"],
    },
    item:[{
        type : ObjectId,
        ref:"Item",
    }]
})

module.exports = monggose.model("Category", categorySchema)