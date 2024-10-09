const Item = require("../models/Item");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  createBooking: async (req, res) => {
    try {
      const {
        //definisikan variable inputan
        itemId,
        itemBooked,
        bookingStartDate,
        bookingEndDate,
        firstName, //customer item, referensi dari model Customer
        lastName, //customer item, referensi dari model Customer
        email, //customer item, referensi dari model Customer
        phoneNumber, //customer item, referensi dari model Customer
        bankForm,
        accountHolder,
      } = req.body;

      //console.log(req.body); //for testing
      if (!req.file) {
        // error handling jika lupa upload data bukti transfer
        return res.status(400).json({ message: "not found image" });
      }

      if (
        // error handling jika lupa isi semua field
        itemId === undefined ||
        itemBooked === undefined ||
        bookingStartDate === undefined ||
        bookingEndDate === undefined ||
        firstName === undefined ||
        lastName === undefined ||
        email === undefined ||
        phoneNumber === undefined ||
        bankForm === undefined ||
        accountHolder === undefined
      ) {
        await fs.unlink(path.join(`public/images/${req.file.filename}`)); //untuk hapus file jika upload gagal
        return res.status(400).json({ message: "Please fill all the field" }); //untuk menampilkan jika lupa isi semua field
      }

      const item = await Item.findOne({ _id: itemId }); //mencari item berdasarkan id dari itemId

      if (!item) {
        // error handling jika item tidak ditemukan
        await fs.unlink(path.join(`public/images/${req.file.filename}`)); //untuk hapus file jika upload gagal
        return res.status(404).json({ message: "Item not found" }); //untuk menampilkan jika item tidak ditemukan
      }

      // logic untuk menghitung

      let total = item.itemPrice * itemBooked; //menghitung total , itemPrice = item model, itemBooked = quantity
      let tax = total * 0.1; //menghitung tax

      // membuat No invoice
      const invoice = Math.floor(1000000 + Math.random() * 900000); //membuat No invoice Random

      // membuat data costomer
      const customer = await Customer.create({
        //membuat data costumer dari model Customer
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      // membuat data newBooking , menampung data dari proses di awal
      const newBooking = {
        invoice,
        bookingStartDate,
        bookingEndDate,
        tax, // penambahan di luar Topik
        total: (total += tax), //menambahkan tax total= total + tax
        item: {
          //mengambil data item dari model Booking.item
          _id: item._id,
          name: item.itemName,
          price: item.itemPrice,
          booked: itemBooked, //inputan quantity dari body
        },
        customer: customer._id, //mengambil data customer dari model Booking.customer {Object}
        payments: {
          // mengambil data payments dari model Booking.payments {Object}
          proofPayment: `images/${req.file.filename}`, //file upload
          bankFrom: bankForm,
          accountHolder: accountHolder,
        },
      };

      const booking = await Booking.create(newBooking); //membuat data booking dari menyimpan data newBooking
      res.status(201).json({ message: "Booking created Success", booking }); //menampilkan data booking
    } catch (err) {
      //error handling
      if (req.file) {
        //untuk hapus file jika upload gagal
        await fs.unlink(path.join(`public/images/${req.file.filename}`)); //untuk hapus file jika upload gagal
      }
      res.status(500).json({ message: err.message }); //menampilkan error
    }
  },

  //view
  viewBooking: async (req, res) => {
    //menampilkan data booking saja
    try {
      const booking = await Booking.find(); //find berasal dari mongose, mencari semua data

      booking.length === 0 //jika panjang data samadengan 0
        ? res.status(404).json({ message: "Booking data not found" }) //mengecek not found
        : res.status(200).json(booking); // menampilkan semua data
    } catch (err) {
      //error handling
      res.status(500).json({ message: err.message });
    }
  },
  showDetailBooking: async (req, res) => {
    //menampilkan data booking berdasarkan id dan mengambil data customer
    try {
      const { id } = req.params;
      const booking = await Booking.findOne({ _id: id }).populate("customer"); //find berasal dari mongose, mencari data dari id booking, mengambil data customer

      booking.length === 0 //jika panjang data samadengan 0
        ? res.status(404).json({ message: "Booking data not found" }) //mengecek not found
        : res.status(200).json(booking); // menampilkan semua data
    } catch (err) {
      //error handling
      res.status(500).json({ message: err.message });
    }
  },
  //view//

  //action Reject
  actionReject: async (req, res) => {
    //action reject booking dari admin ke customer
    const { id } = req.params; //mengambil id dari booking

    try {
      const booking = await Booking.findOne({ _id: id }); //mencari booking berdasarkan id booking

      // membuat dua kondisi jika booking status = accept atau reject
      if (booking.payments.status == "Reject") {
        return res
          .status(403)
          .json({ message: "Booking Order Already Reject" });
      }

      if (booking.payments.status == "Accept") {
        return res
          .status(403)
          .json({ message: "Booking Order Already Accept" });
      }
      //jika status nya bukan di antara dua di atas maka akan lengusng di rubah di bawah
      booking.payments.status = "Reject"; //mengubah status booking menjadi reject
      //

      booking.proofBy = req.user._id; //mengambil id user yang melakukan reject booking {admin}
      await booking.save(); //update data
      res.status(200).json(booking); //mengecek booking
    } catch (err) {
      //error handling
      res.status(500).json({ message: err.message });
    }
  },
  //action Reject//

  //action Accept
  actionAccept: async (req, res) => {
    const { id } = req.params;

    try {
      const booking = await Booking.findOne({ _id: id }); //mencari booking berdasarkan id booking

      // mengambil data item dari booking karena menggunakan array dan nested array
      const {
        // destructuring data booking, untuk mengambil id dan jumlah booked
        item: { _id, booked },
      } = booking;

      const item = await Item.findOne({ _id: _id }); //mencari item berdasarkan id item dari model booking

      // membuat dua kondisi jika booking status = accept atau reject
      if (booking.payments.status == "Reject") {
        return res
          .status(403)
          .json({ message: "Booking Order Already Reject" });
      }
      if (booking.payments.status == "Accept") {
        return res
          .status(403)
          .json({ message: "Booking Order Already Accept" });
      }
      //jika status nya bukan di antara dua di atas maka akan lengusng di rubah ke accept

      booking.payments.status = "Accept"; //mengubah status booking menjadi Accept
      item.sumBooked += parseInt(booked); // menambahkan jumlah booking/booked pada item
      booking.proofBy = req.user._id; // mengambil id user yang melakukan accept booking {admin}
      await item.save(); //update data
      await booking.save(); //update data
      res.status(200).json(booking); //mengecek booking
    } catch (err) {
      //error handling
      res.status(500).json({ message: err.message });
    }
  },
  //action Accept//

  //action Delete
  deleteBooking: async (req, res) => {
    try {
      const { id } = req.params; //mengambil id dari booking , menggunakan params
      const booking = await Booking.findOne({ _id: id }); //mencari booking berdasarkan id booking

      if (!booking) {
        //jika booking tidak ditemukan // TIDAK BISA BEKERJA
        return res.status(404).json({ message: "Booking data not found" });
      }

      // mengambil data payments dari booking karena menggunakan array dan nested array
      const { // destructuring data booking, untuk mengambil status dan proofPayment
        payments: { status, proofPayment },
      } = booking;

      if (status != "Process") { //jika status bukan process
        return res
          .status(403)
          .json({ message: "Only can delete booking with status Process" });
      }

      await booking //menghapus data booking
        .remove()
        .then(() => fs.unlink(path.join(`public/${proofPayment}`))); //menghapus data proofPayment berbentuk gambar
      res.status(200).json({ message: "Booking deleted" , booking }); //menampilkan pesan
    } catch (err) { //error handling
        //handling jika tidak ditemukan id booking
        if (err.kind === "ObjectId") {
          return res.status(404).json({ message: "Booking data not found" });
        }
      res.status(500).json({ message: err.message });
    }
  },
  //action Delete //
};
