const Feature = require("../models/Feature");
const Item = require("../models/Item");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  addFeature: async (req, res) => {
    console.log(req.body); //for testing
    const { featureName, qty, item } = req.body; // parameter yang di get dari body

    if (!req.file) {
      return res.status(400).json({ message: "not found image" });
    }

    try {
      const feature = await Feature.create({
        featureName,
        qty,
        item,
        imageUrl: `images/${req.file.filename}`, // di get dari multer
      });

      const itemDb = await Item.findOne({ _id: item }); //membuat variabel baru untuk mencari dan memasukan id item ke itemDb
      itemDb.feature.push({ _id: feature._id });
      await itemDb.save();

      res.status(201).json(feature);
    } catch (err) {
      await fs.unlink(path.join(`public/images/${req.file.filename}`)); //untuk hapus file jika upload gagal
      res.status(500).json({ message: err.message });
    }
  },

  viewFeature: async (req, res) => {
    try {
      const feature = await Feature.find() // menampilkan semua data
        .populate({ path: "item", select: "id itemName" }); //populate digunakan untuk relasi data atau join jika di sql, mengambil dari data model feature yg sudah di relasi ke model item

      feature.length === 0 //handling jika panjang data samadengan 0 maka menampilkan not found jika ada akan menampilkan semua data {ternarity operator}
        ? res.status(404).json({ message: "Feature not found" })
        : res.status(200).json(feature);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateFeature: async (req, res) => {
    console.log(req.body); //for testing

    // const { id } = req.params
    const id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ["featureName", "qty", "item"]; //parameter key yang boleh diupdate
    const isValidaOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidaOperation) {
      return res.status(403).json({ message: "invalid Key Praramaeter" });
    }
    try {
      const feature = await Feature.findById({ _id: id });
      if (req.file == undefined) {
        // jika tidak ada file yang di upload {hanya update data text}
        updates.forEach((update) => {
          feature[update] = req.body[update]; //mengambil nilai value dari body dan dimasukan ke database
        });
        await feature.save(); //update data
        res.status(200).json(feature); //menampilkan data
      } else {
        //jika ada file yang di upload untuk update data gambar n text
        await fs.unlink(path.join(`public/${feature.imageUrl}`)); //untuk hapus file sebelumnya jika di uload
        updates.forEach((update) => {
          feature[update] = req.body[update]; //mengambil nilai value dari body dan dimasukan ke database
        });
        feature.imageUrl = `images/${req.file.filename}`; // menambahkan 1 key baru imageUrl //mengambil nilai value dari body dan dimasukan ke database
        await feature.save();
        res.status(200).json(feature);
      }
    } catch (err) { //error handling
      if (req.file) { //jika ada file yang di upload , tetapi tidak berhasil di update
        await fs.unlink(path.join(`public/images/${req.file.filename}`)); //untuk hapus file
      }
      res.status(500).json({ message: err.message }); //menampilkan error
    }
  },

  deleteFeature: async (req, res) => {
    try {
      const id = req.params.id;
      const feature = await Feature.findOne({ _id: id }); //membuat variabel baru untuk mencari dan memasukan id feature ke feature

      if (!feature) { // handling error apakah ada data feature
        return res.status(404).json({ message: "Feature not found" });
      }

      async function deleteItem() {
        // membuat function deleteItem
        const itemDb = await Item.findOne({ _id: feature.item }); //membuat variabel baru untuk mencari dan memasukan id item ke itemDb
        for (let i = 0; i < itemDb.feature.length; i++) {
          // karena menggunakan array di model item yang sudah di relasi dengan feature, harus menggunakan looping
          if (itemDb.feature[i]._id.toString() === feature._id.toString()) {
            //mengecek data dari database data dari model item dan apakah sama dengan id yg di cari dari parameter {di rubah ke string}
            itemDb.feature.pull({ _id: feature._id }); //menghilangkan id yg di cari
            await itemDb.save(); //menyimpan data
          }
        }
      }
      await feature.remove()
      .then(() =>deleteItem())
      .then(() =>fs.unlink(path.join(`public/${feature.imageUrl}`))
      );

      res.status(200).json({ message: "Feature deleted successfully", feature });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
