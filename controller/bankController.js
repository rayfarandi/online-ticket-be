const Bank = require("../models/Bank");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  addBank: async (req, res) => {
    //console.log(req.body); //for testing
    const { bankName, accountNumber, accountHolder } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "not found image" });
    }
    try {
      const bank = new Bank({
        //membuat variabel bank, dan mengambil semua data dari input user request body
        bankName,
        accountNumber,
        accountHolder,
        imageUrl: `images/${req.file.filename}`,
      });

      await bank.save(); //untuk save data
      res.status(201).json(bank); //menampilkan data
    } catch (err) {
      //jika ada error
      await fs.unlink(path.join(`public/images/${req.file.filename}`)); //untuk hapus file jika upload gagal
      res.status(500).json({ message: err.message });
    }
  },

  updateBank: async (req, res) => {
    //console.log(req.body); //for testing
    const updates = Object.keys(req.body);
    const allowedUpdates = ["bankName", "accountNumber", "accountHolder"]; //parameter key yang boleh diupdate
    const isValidaOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidaOperation) {
      return res.status(403).json({ message: "invalid Key Praramaeter" });
    }
    try {
      const bank = await Bank.findById(req.params.id);
      if (req.file == undefined) {
        // jika tidak ada file yang di upload {hanya update data text}
        updates.forEach((update) => {
          bank[update] = req.body[update];
        });
        await bank.save();
        res.status(200).json(bank);
      } else {
        //jika ada file yang di upload untuk update data gambar n text
        await fs.unlink(path.join(`public/${bank.imageUrl}`)); //untuk hapus file sebelumnya jika di uload
        updates.forEach((update) => {
          bank[update] = req.body[update];
        });
        bank.imageUrl = `images/${req.file.filename}`;
        await bank.save();
        res.status(200).json(bank);
      }
    } catch (err) {
      if (req.file) {
        await fs.unlink(path.join(`public/images/${req.file.filename}`));
      }
      res.status(500).json({ message: err.message });
    }
  },

  viewBank: async (req, res) => {
    try {
      const bank = await Bank.find(); //find berasal dari mongose
      bank.length === 0
        ? res.status(404).json({ message: "Bank not found" })
        : res.status(200).json(bank);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteBank: async (req, res) => {
    try {
      const bank = await Bank.findByIdAndDelete(req.params.id);
      if (!bank) {
        return res.status(404).send({ message: "bank not found" }); // error handling jika data bank tidak ditemukan
      } else {
        await bank
          .remove() //jika berhasil di remove bank
          .then(() => fs.unlink(path.join(`public/${bank.imageUrl}`))); //untuk hapus file jika di uload dengan promise
        res.status(200).json({ message: "bank deleted" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
