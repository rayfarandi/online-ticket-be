// untuk menambah dan menghapus image dari item //
const Item = require("../models/Item");
const Image = require("../models/Image");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  addImageItem: async (req, res) => {
    const { id } = req.params; //mengambil id
    
    try {
      if (req.file) {
        //jika ada file, upload single image
        const item = await Item.findOne({ _id: id }); //mencari item berdasarkan id dari parameter

        const imageSave = await Image.create({
          //membuat variabel imageSave di simpan ke model Image
          imageUrl: `images/${req.file.filename}`,
        });
        item.image.push({
           _id: imageSave._id //menyimpan data image id ke array list di dalam item model
        }); 

        await item.save(); //menyimpan data
        res.status(201).json(imageSave); //menampilkan data
      } else {
        //jika tidak ada file
        res.status(400).json({ message: "Please upload an image" }); //menampilkan pesan error
      }
    } catch (err) {
      //mengecek error
      res.status(500).json({ message: err.message });
    }
  },

  deleteImageItem: async (req, res) => {
    // id image._id, itemId item._id

    const { id, itemId } = req.params; //mengambil id dan itemId
    try {
      const item = await Item.findOne({ _id: itemId }); //mencari item berdasarkan id dari image itemId
      const image = await Image.findOne({ _id: id }); //mencari image berdasarkan id dari parameter
      
      if (!item) {
        // handling jika item tidak ditemukan id yg di cari
        return res.status(404).send({ message: "Item not found" });
      }
      if (!image) {
        // handling jika image tidak ditemukan id yg di cari
        return res.status(404).send({ message: "Image not found" });
      }
      
      async function deleteImageOnItem() {
        //fungsi delete image di item
        for (let i = 0; i < item.image.length; i++) {
          //mengecek semua item.image di array
          if (item.image[i]._id.toString() === image._id.toString()) {
            //mengecek item.image[i]._id == image._id
            item.image.pull({ _id: image._id }); // menarik data id yg sudah di cek dari item.image
            await item.save(); //menyimpan data
          }
        }
      }
      await image.remove() //menghapus image
      .then(() => deleteImageOnItem()) //memanggil fungsi deleteImageOnItem
      .then(() => fs.unlink(path.join(`public/${image.imageUrl}`))); //menghapus image
      
      res.status(200).json({ message: "Image deleted", image });
    } catch (err) {
      //menangkap error
      res.status(500).json({ message: err.message });
    }
  },
};
