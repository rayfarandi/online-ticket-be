const monggose = require("mongoose");
const { ObjectId } = monggose.Schema;

const bookingSchema = new monggose.Schema({
  bookingStartDate: {
    type: Date,
    required: [true, "Please add a start date!"],
  },
  bookingEndDate: {
    type: Date,
    required: true,
  },
  invoice: {
    type: String,
    required: true,
  },
  item: {
    _id: {
      type: ObjectId,
      ref: "Item",
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    booked: { type: Number, required: true },
  },
  tax: { // penambahan diluar Topik
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  customer: [
    {
      type: ObjectId,
      ref: "Customer",
    },
  ],
  payments: {
    proofPayment: { type: String, required: true }, // data gambar bukti pembayaran
    bankFrom: { type: String, required: true },
    accountHolder: { type: String, required: true },
    status: { type: String, default: "Process" },
    

  },
  proofBy: {
    type: ObjectId,
    ref: "User",
  },
});

module.exports = monggose.model("Booking", bookingSchema);
