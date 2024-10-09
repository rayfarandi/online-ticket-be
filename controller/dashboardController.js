const Item = require("../models/Item");
const Booking = require("../models/Booking");

module.exports = {
  viewDashboard: async (req, res) => {
    try {
      let sumBooked, sumProcess, sumReject, sumAccept, sumItem; //deklarasi variabel
      const totalBooked = await Booking.find(); //mencari semua booking(membuat fariabel baru untuk menyimpan data sementara)
      const process = await Booking.find({ "payments.status": "Process" }); //mencari semua booking dengan filter status process(membuat fariabel baru untuk menyimpan data sementara)
      const reject = await Booking.find({ "payments.status": "Reject" }); //mencari semua booking dengan filter status reject(membuat fariabel baru untuk menyimpan data sementara)
      const accept = await Booking.find({ "payments.status": "Accept" }); //mencari semua booking dengan filter status accept(membuat fariabel baru untuk menyimpan data sementara)
      const item = await Item.find(); //mencari semua item(membuat fariabel baru untuk menyimpan data sementara)

      // membuat kondisi jika data ada atau tidak dari temporari variabel
      totalBooked.length !== 0 //jika panjang data booking tidak sama dengan 0 {ternary operator}
        ? (sumBooked = totalBooked.length) //jika panjang data booked ada maka menampilkan data
        : (sumBooked = 0); //jika tidak ada memberi nilai 0
      process.length !== 0 //jika panjang data process tidak sama dengan 0 {ternary operator}
        ? (sumProcess = process.length) //jika panjang data process ada maka menampilkan data
        : (sumProcess = 0); //jika tidak ada memberi nilai 0
      reject.length !== 0 //jika panjang data reject tidak sama dengan 0 {ternary operator}
        ? (sumReject = reject.length) //jika panjang data reject ada maka menampilkan data
        : (sumReject = 0); //jika tidak ada memberi nilai 0
      accept.length !== 0 //jika panjang data accept tidak sama dengan 0 {ternary operator}
        ? (sumAccept = accept.length) //jika panjang data accept ada maka menampilkan data
        : (sumAccept = 0); //jika tidak ada memberi nilai 0
      item.length !== 0 //jika panjang data item tidak sama dengan 0 {ternary operator}
        ? (sumItem = item.length) //jika panjang data item ada maka menampilkan data
        : (sumItem = 0); //jika tidak ada memberi nilai 0

      res.status(200).json({
        //menampilkan semua data dalam response {merubah dengan format string, agakr lebih mudah untuk di olah saat di frontend}
        booked: String(sumBooked),
        process: String(sumProcess),
        reject: String(sumReject),
        accept: String(sumAccept),
        item: String(sumItem),
      });
    } catch (err) { //handling error
      res.status(500).json({ message: err.message });
    }
  },
};
