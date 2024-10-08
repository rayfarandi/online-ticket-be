const Item = require("../models/Item");
const Category = require("../models/Category");
const Image = require("../models/Image");
const Feature = require("../models/Feature");
const Info = require("../models/Info");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  addItem: async (req, res) => {
    try {
      console.log(req.body); //for testing
      const { itemName, itemPrice, unit, location, description, category } =
        req.body; // parameter key yg di pelukan

      if (req.files) {
        //jika ada file mulitpel mengunakan files, jika singgle mengunakan file
        const categoryDb = await Category.findOne({ _id: category }); //membuat variabel baru untuk mencari dan memasukan id catagory ke categoryDb

        const newItem = new Item({
          category, //categoryID // relasi dari Category
          itemName,
          itemPrice,
          unit,
          location,
          description,
        });
        const item = await Item.create(newItem); //membuat variabel baru item
        categoryDb.item.push({ _id: item._id });
        await categoryDb.save();

        for (let i = 0; i < req.files.length; i++) {
          //untuk upload gambar multipel, di jadikan menjadi array sesuai dengan fungsi di multer
          const imageSave = await Image.create({
            //membuat variabel imageSave di simpan ke model Image
            imageUrl: `images/${req.files[i].filename}`,
          });
          item.image.push({ _id: imageSave._id });
          await item.save();
        }
        res.status(201).json(item);
      } else {
        //jika tidak ada file
        res.status(400).json({ message: "image not found" });
      }
    } catch (error) {
      for (let i = 0; i < req.files.length; i++) {
        // handling error upload multiple image
        await fs.unlink(path.join(`public/images/${req.files[i].filename}`));
      }
      res.status(500).json({ message: error.message }); // menampilkan error message yang berada di models item & dari server (jika ada kendala dari server itu sendiri)
    }
  },

  viewItem: async (req, res) => {
    try {
      const item = await Item.find() // menampilkan semua data
        .populate({ path: "category", select: " id categoryName" }) //populate digunakan untuk relasi data atau join jika di sql, mengambil dari data model items yg sudah di relasi ke model category
        .populate({ path: "image", select: "id imageUrl" }) //populate digunakan untuk relasi data atau join jika di sql
        .populate({ path: "info", select: "id infoName" }) //populate digunakan untuk relasi data atau join jika di sql
        .populate({ path: "feature", select: "id featureName" }); //populate digunakan untuk relasi data atau join jika di sql

      item.length === 0 //handling jika panjang data samadengan 0 maka menampilkan not found jika ada akan menampilkan semua data {ternarity operator}
        ? res.status(404).json({ message: "Item not found" })
        : res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateItem: async (req, res) => {
    console.log(req.body); //for testing
    const updates = Object.keys(req.body); //mengambil semua data dari input user request body
    const allowedUpdates = [
      //parameter key yang boleh diupdate
      "itemName",
      "itemPrice",
      "unit",
      "location",
      "description",
      "category",
      "isPopular",
    ];
    const isValidOperation = updates.every(
      (update) => allowedUpdates.includes(update) //mengecek apakah ada data update dari parameter di array allowedUpdates{parameter yang di perbolehkan}
    );
    if (!isValidOperation) {
      //jika tidak ada data update dari parameter di array allowedUpdates{parameter yang di perbolehkan}
      return res.status(403).send({ error: "Wrong Parameter!" });
    }

    try {
      const item = await Item.findById(req.params.id) //mencari data berdasarkan id , mengunakan findById dari monggose
        .populate({ path: "category", select: " id categoryName" }) //populate digunakan untuk relasi data atau join jika di sql, mengambil dari data model items yg sudah di relasi ke model category
        .populate({ path: "image", select: "id imageUrl" }); //populate digunakan untuk relasi data atau join jika di sql

      updates.forEach((update) => {
        //mengambil semua data dari input user request body
        item[update] = req.body[update];
      });
      await item.save(); //update data
      res.status(200).json(item); //menampilkan semua data yang di save
    } catch (error) {
      //error handling
      res.status(500).json({ message: error.message });
    }
  },

  deleteItem: async (req, res) => {
    try {
      const { id } = req.params; // menerima parameter id yg akan dihapus
      const item = await Item.findOne({ _id: id }); //mencari data berdasarkan id , mengunakan findOne dari monggose
      if (!item) {
        // handling jika item tidak ditemukan id yg di cari
        return res.status(404).send({ message: "Item not found" });
      }
      const categoryDb = await Category.findOne({ _id: item.category }); //mencari data berdasarkan id , mengunakan findOne dari monggose{mengambil data dari model category}

      async function deleteCategory() {
        // membuat function deleteCategory
        for (let i = 0; i < categoryDb.item.length; i++) {
          // karena menggunakan array di model category yang sudah di relasi dengan item, harus menggunakan looping
          if (categoryDb.item[i]._id.toString() === item._id.toString()) {
            //mengecek data dari database data dari model category dan apakah sama dengan id yg di cari dari parameter {di rubah ke string}
            categoryDb.item.pull({ _id: item._id }); //menghilangkan id yg di cari
            await categoryDb.save(); //menyimpan data
          }
        }
      }

      function deleteImage() {
        // membuat function deleteImage
        for (let i = 0; i < item.image.length; i++) {
          // karena menggunakan array di model item yang sudah di relasi dengan image, harus menggunakan looping
          Image.findOne({ _id: item.image[i]._id }) //mencari data berdasarkan id dari array item.image , mengunakan findOne dari monggose
            .then((image) => {
              //jika data image sudah ditemukan maka akan melanjutkan proses delete{promise}
              fs.unlink(`public/${image.imageUrl}`); // delete data image
              image.remove(); // remove data image dari database
            })
            .catch((err) => {
              // jika data image tidak ditemukan {promise}
              res.status(500).status({ message: err.message }); // handling jika data image tidak ditemukan
            });
        }
      }

      async function deleteInfo() {
        // membuat function delete Info
        for (let i = 0; i < item.info.length; i++) {
          // karena menggunakan array di model item yang sudah di relasi dengan info, harus menggunakan looping
          Info.findOne({ _id: item.info[i]._id }) //mencari data berdasarkan id dari array item.info , mengunakan findOne dari monggose
            .then((info) => {
              //jika data info sudah ditemukan maka akan melanjutkan proses delete{promise}
              fs.unlink(`public/${info.imageUrl}`); // delete data info
              info.remove(); // remove data info dari database
            })
            .catch((err) => {
              // jika data info tidak ditemukan {promise}
              res.status(500).status({ message: err.message }); // handling jika data info tidak ditemukan
            });
        }
      }

      async function deleteFeature() {
        // membuat function deleteFeature
        for (let i = 0; i < item.feature.length; i++) {
          // karena menggunakan array di model item yang sudah di relasi dengan feature, harus menggunakan looping
          Feature.findOne({ _id: item.feature[i]._id }) //mencari data berdasarkan id dari array item.feature , mengunakan findOne dari monggose
            .then((feature) => {
              //jika data feature sudah ditemukan maka akan melanjutkan proses delete{promise}
              fs.unlink(`public/${feature.imageUrl}`); // delete data feature
              feature.remove(); // remove data feature dari database
            })
            .catch((err) => {
              // jika data feature tidak ditemukan {promise}
              res.status(500).status({ message: err.message }); // handling jika data feature tidak ditemukan
            });
        }
      }

      await item
        .remove() //hapus item
        .then(() => deleteCategory()) //setelah item di hapus, lakukan deleteCategory
        .then(() => deleteImage()) //setelah item di hapus, lakukan deleteImage
        .then(() => deleteInfo()) //setelah item di hapus, lakukan delete Info
        .then(() => deleteFeature()); //setelah item di hapus, lakukan deleteFeature

      res.status(200).json({ message: "Item deleted" }); //menampilkan pesan jika item di hapus
    } catch (error) {
      res.status(500).json({ message: error.message }); //menampilkan pesan jika item error dari server
    }
  },
};
