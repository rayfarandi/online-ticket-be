const Item = require("../models/Item");
const Category = require("../models/Category");
const Info = require("../models/Info");
const Bank = require("../models/Bank");

module.exports = {
    homePage: async (req, res) => {
        try {
          // tarik data item paling banyak dipesan berdasarkan sumBooked
          const hotItem = await Item.find() //find berasal dari mongose {menampilkan data dari Item}
            .select( //select data dari Item, yang dibutuhkan
              "_id itemName location itemPrice unit imageId sumBooked isPopular"
            )
            .limit(5) //mengambil 5 data
            .populate({ //populate digunakan untuk relasi data atau join jika di sql, mengambil dari data model items yg sudah di relasi ke model image
              path: "image", // arahkan ke  model image
              select: "_id imageUrl", //select data dari image, yang dibutuhkan
              option: { sort: { sumbooked: -1 } } //mengurutkan data berdasarkan sumBooked {-1 Descending},
            });

          // tarik data dari category
          const categoryList = await Category.find({ //find berasal dari mongose {menampilkan data dari Category}
            $where: "this.item.length > 0", //mengunakan query $where , mencari data catagory yang memiliki data item di dalamnya
          })
            .limit(3) //mengambil 3 data
            .populate({ //populate digunakan untuk relasi data atau join jika di sql mengambil dari data model items
              path: "item", //arahkan ke model item
              select: "_id itemName location itemPrice unit imageId  isPopular", //select data yang di butuhkan
              perDocumentLimit: 4, //mengambil 4 data
              option: { sort: { sumbooked: -1 } }, //mengurutkan data berdasarkan sumBooked {-1 Descending},
              populate: { path: "image", perDocumentLimit: 1 }, //untuk menarik data gambar berdasarkan model image yang ada di model item, dan mengambil 1 data
            });
      
            // tarik data testimony dari info
          const testimony = await Info.find({ //find berasal dari mongose {menampilkan data dari Info}
            type: "Testimony", // filter berdasarkan type dan isHighlight
            isHighlight: true,
          })
            .select("_id infoName type description imageUrl item") //select data yang di butuhkan
            .limit(3) //mengambil 3 data
            .populate({ path: "item", select: "_id itemName location," }); //populate digunakan untuk relasi data atau join jika di sql, mengambil dari data model items

      
            const Hotel = await Category.find({categoryName: "Hotel"}) // mencari data category item hotel dari database Category
            const Event = await Category.find({categoryName: "Event"}) // mencari data category item event dari database Category
            const Tour = await Category.find({categoryName: "Tour Package"}) // mencari data category item tour dari database Category
            
            const SumHotel = Hotel.reduce((count,curent)=>count+curent.item.length,0) //menghitung jumlah item hotel dengan menggunakan reduce untuk menghitung panjang data {array}
            const SumEvent = Event.reduce((count,curent)=>count+curent.item.length,0) //menghitung jumlah item event dengan menggunakan reduce untuk menghitung panjang data {array}
            const SumTour = Tour.reduce((count,curent)=>count+curent.item.length,0) //menghitung jumlah item tour dengan menggunakan reduce untuk menghitung panjang data {array}
      
            // menampilkan semua data
            res.status(200).json({
                summaryInfo:{ //menampilkan semua data sumarry
                  sumHotel: SumHotel,
                  sumEvent: SumEvent,
                  sumTour: SumTour
                },
                hotItem, //menampilkan hasil data item paling banyak dipesan berdasarkan sumBooked
                categoryList, //menampilkan data categoryList
                testimony, //menampilkan data testimony dari info
            })
        } catch (err) { //error handling
          res.status(500).json({ message: err.message });
        }
      },

      detailPage: async (req, res)=>{
        try {
          const {id} = req.params;
          const item = await Item.findOne({_id: id}) // menampilkan semua data, filter berdasarkan id dari key parameter
            .populate({ path: "category", select: " id categoryName" }) //populate digunakan untuk relasi data atau join jika di sql, mengambil dari data model items yg sudah di relasi ke model category
            .populate({ path: "image", select: "id imageUrl" }) //populate digunakan untuk relasi data atau join jika di sql
            .populate({ path: "info", match : {type: {$in: ["NearBy", "Testimony"]}} }) //populate digunakan untuk relasi data atau join jika di sql, menarik data dari model info dan filter untuk testimony dan Nearby
            .populate({ path: "feature"}); //populate digunakan untuk relasi data atau join jika di sql, menarik data dari model feature
    
          const bank = await Bank.find(); // menampilkan semua data

          res.status(200).json({
            ...item._doc, // menampilkan semua data, dalam bentuk string {agar tidak di kirim dengan bentuk object, karena nested array terlalu banyak}
            bank // menampilkan semua data, dalam bentuk object{karena data tidak nested}
          });
        } catch (error) { //error handling
          res.status(500).json({ message: error.message });
        }
      },
}
