const monggose = require("mongoose");

//env
require("dotenv").config({ path: "./.env" });

const connectDB = async () => {
    try{
        const conn = await monggose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex : true,
            useFindAndModify: false
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch(error){
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
    

}

module.exports = connectDB