// import env
require("dotenv").config({ 
  path: "./.env" });

// import Modules
const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();
// connect to mongoDB
const connectDB = require("./database/db");

//import Router
const categoryRouter = require("./router/categoryRouter");
const bankRouter = require("./router/bankRouter");
const itemRouter = require("./router/itemRouter");
const featureRouter = require("./router/featureRouter");
const infoRouter = require("./router/infoRouter");
const customerRouter = require("./router/customerRouter");
const bookingRouter = require("./router/bookingRouter");
const userRouter = require("./router/userRouter");
const dashboardRouter = require("./router/dashboardRouter")

// connect to DB
connectDB();

//Setup Cors & morgan
app.use(cors());
app.use(logger("dev"));

// setup post json
app.use(express.json()); //body parser

// setup url encoded
app.use(express.urlencoded({ extended: false })); //url encoded

// setup cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Authorization, authorization, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

// setup public url for file
app.use(express.static(path.join(__dirname, "public")));

//use Router url
app.use("/api/category", categoryRouter); //routing on category
app.use("/api/bank", bankRouter); //routing on category
app.use("/api/item", itemRouter); //routing on item
app.use("/api/item/feature", featureRouter); //routing on feature
app.use("/api/item/info", infoRouter); //routing on info
app.use("/api/customer", customerRouter); //routing on customer
app.use("/api/booking", bookingRouter); //routing on booking
app.use("/api/user", userRouter); //routing on user
app.use("/api/dashboard", dashboardRouter); //routing on dashboard

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
