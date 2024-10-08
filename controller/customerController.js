const Customer = require("../models/Customer");

module.exports = {
  addCustomer: async (req, res) => {
    console.log(req.body); //for testing

    const customer = new Customer({
      ...req.body, // ... = spread operator , mengambil semua data dari input user request body
    });

    try {
      // handling jika email customer sudah ada
      let user = await Customer.findOne({ email: req.body.email }); //mencari data email customer .findOne berasal dari mongose

      //belum di gunakan dulu
      // if (user) {
      //   return res.status(400).json({ message: "Email already exists" });
      // }

      await customer.save(); //save data
      res.status(201).json(customer); //menampilkan data
    } catch (err) {
      res.status(400).json({ message: err.message }); //mengecek error
    }
  },

  viewCustomer: async (req, res) => {
    try {
      const customer = await Customer.find(); // .find berasal dari mongose
      customer.length === 0 //jika panjang data samadengan 0
        ? res.status(404).json({ message: "Customer not found" }) //mengecek not found
        : res.status(200).json(customer); // menampilkan semua data
    } catch (err) {
      res.status(500).json({ message: err.message }); //mengecek error
    }
  },

  updateCustomer: async (req, res) => {
    console.log(req.body); //for testing
    const updates = Object.keys(req.body); //mengambil semua data dari input user request body
    const allowedUpdates = ["firstName", "lastName", "address", "phoneNumber"]; //parameter key yang boleh diupdate
    const isValidaOperation = updates.every(
      (
        update //mengecek apakah ada data update dari parameter di array allowedUpdates{parameter yang di perbolehkan}
      ) => allowedUpdates.includes(update)
    );

    if (!isValidaOperation) {
      //jika tidak ada data update dari parameter di array allowedUpdates{parameter yang di perbolehkan}
      return res.status(403).json({ message: "invalid Key Praramaeter" });
    }

    try {
      const customer = await Customer.findById(req.params.id); //mencari data id customer .findById berasal dari mongose
      if (!customer) {
        //jika customer tidak ditemukan // TIDAK BISA BEKERJA
        return res.status(404).json({ message: "Customer not found" });
      }

      updates.forEach((update) => {
        //mengambil semua data dari input user request body
        customer[update] = req.body[update];
      });

      await customer.save(); //update data
      res.status(200).json(customer); //menampilkan semua data yang di save
    } catch (err) {
      if (err.kind === "ObjectId") {
        // handling jika id customer tidak ditemukan
        return res.status(400).json({ message: "Customer not found" });
      }
      res.status(500).json({ message: err.message }); //mengecek error
    }
  },

  deleteCustomer: async (req, res) => {
    try {
      const customer = await Customer.findByIdAndDelete(req.params.id); //mencari data id customer .findByIdAndDelete berasal dari mongose
      if (!customer) {
        //jika customer tidak ditemukan
        return res.status(404).json({ message: "Customer not found" });
      }
      customer // jika id customer ditemukan
        ? res.status(200).json({ message: "Customer deleted", customer }) //mencetak deleted
        : res.status(404).json({ message: "Customer not found" }); //mencetak not found
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
