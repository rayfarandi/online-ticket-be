const Info = require("../models/Info");
const Item = require("../models/Item");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    addInfo: async (req,res)=>{
        //console.log(req.body); //for testing
        const {infoName, type, isHighlight, description, item} = req.body;
        //imageUrl= di generet dari multer, maka tidak perlu di request
        
        if(!req.file) {
            return res.status(403).json({message: "Info Image Not Found!"});
        }

        try{
            const info = await Info.create({
                infoName,
                type,
                isHighlight,
                description,
                item,
                imageUrl: `images/${req.file.filename}`,
            })
            //membuat push array ke dalam database dan menyimpan di model item , berelasikan dengan info {yg bawah}
            const itemDB = await Item.findOne({_id: item});
            itemDB.info.push({_id: info._id});
            await itemDB.save();

            res.status(201).json(info);
        }catch(err){
            await fs.unlink(path.join(`public/images/${req.file.filename}`)); // handling jika gambar tidak bisa upload dan data gambar di hapus
            res.status(500).json({message: err.message}); //handling jika error berasal dari input parameter
        }
    },

    viewInfo: async (req, res) => {
        try {
            const info = await Info.find() //menampilkan semua data
            .populate({ //populate digunakan untuk relasi data atau join jika di sql, mengambil dari data model items yg sudah di relasi ke model info
                path: "item",
                select: "id itemName",
            })
            info.length === 0 //handling jika panjang data samadengan 0 maka menampilkan not found jika ada akan menampilkan semua data {ternarity operator}
            ? res.status(404).json({ message: "Info data not found" })
            : res.status(200).json(info);
        }catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    updateInfo : async (req, res) =>{
        console.log(req.body); //for testing

        const id = req.params.id; //mengambil id
        const updates = Object.keys(req.body); //mengambil semua data dari input user request body
        const allowedUpdates = [
        //parameter key yang boleh diupdate
            "infoName",
            "type",
            "isHighlight",
            "description",
            "item",
        ];
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update) //mengecek apakah ada data update dari parameter di array allowedUpdates{parameter yang di perbolehkan}
        );
        if (!isValidOperation) {
            return res.status(403).send({ error: "Wrong Parameter!" });
        }
        try {
            const info = await Info.findById(id);
            if (req.file == undefined) { // jika tidak ada file yang di upload {hanya update data text}
                updates.forEach((update) => {
                    info[update] = req.body[update]; //mengambil nilai value dari body dan dimasukan ke database
                });
                await info.save(); //update data
                res.status(200).json(info); //menampilkan data
            } else {
                //jika ada file yang di upload untuk update data gambar n text
                await fs.unlink(path.join(`public/${info.imageUrl}`)); //untuk hapus file sebelumnya jika di uload
                updates.forEach((update) => {
                    info[update] = req.body[update]; //mengambil nilai value dari body dan dimasukan ke database
                });
                info.imageUrl = `images/${req.file.filename}`; // menambahkan 1 key baru imageUrl //mengambil nilai value dari body dan dimasukan ke database
                await info.save(); //update data
                res.status(200).json(info); //menampilkan data
            }
        }catch (err) { //error handling
            if (req.file) { //jika ada file yang di upload , tetapi tidak berhasil di update
              await fs.unlink(path.join(`public/images/${req.file.filename}`)); //untuk hapus file
            }
            res.status(500).json({ message: err.message }); //menampilkan error
          }
    },

    deleteInfo: async (req, res) => {
        try{
            const id = req.params.id;
            const info = await Info.findOne({ _id: id}) //membuat variabel baru untuk mencari dan memasukan id info ke Info

            if (!info){ // handling error apakah ada data info
                return res.status(404).json({message: "Info not found"})
            }
            async function deleteItem(){
                // membuat function deleteItem
                const itemDB = await Item.findOne({_id: info.item}); //membuat variabel baru untuk mencari dan memasukan id item ke itemDb, jika data sesuai dengan id di Item maka akan menjalankan fungsi di bawah
                for (let i = 0; i < itemDB.info.length; i++) { // looping array info, jika id item yang di cari sesuai dengan id info yang di cari, maka akan di hapus
                    if(itemDB.info[i]._id.toString() === info._id.toString()){
                        itemDB.info.pull({_id: info._id}); //menghapus id info
                        await itemDB.save(); //update data
                    }
                }
            }
            await info.remove()
            .then(() => deleteItem()) //untuk memanggil function deleteItem
            .then(() => fs.unlink(path.join(`public/${info.imageUrl}`))) //untuk hapus file
            
            res.status(200).json({message: "Info deleted", info}); //menampilkan data
        }catch(err){ //error handling
            res.status(500).json({message: err.message}); //menampilkan error
        }
    },
    

}