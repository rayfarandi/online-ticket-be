const User = require("../models/User");

module.exports = {
  addUser: async (req, res) => {
    try {
      // console.log(req.body);
      const { userName, email, role, password, passwordConfirm } = req.body; // parameter key yang di perlukan
      if (password !== passwordConfirm) {
        // cek password dan password confirm
        throw Error("Password not match with confirm password");
      }

      const cekUserName = await User.find({ userName: userName }).count(); // cek username sudah ada atau belum
      const cekEmail = await User.find({ email: email }).count(); // cek email sudah ada atau belum
      if (cekUserName + cekEmail > 0) {
        // cek username dan email jika sudah ada maka akan mengeluarkan error
        throw Error("Username or Email already exist");
      }

      const user = new User(req.body); // mengambil semua data dari input user request body

      // beberapa cara yang berbeda dengan yang dibawah
      //const user = new User({
      //  ...req.body, // ... = spread operator , mengambil semua data dari input user request body
      //   });

      // const user = new User({
      //   userName,
      //   email,
      //   password,
      //   passwordConfirm,
      //   role,
      // });
      //

      await user.save(); // save data
      //   res.status(200).json({message : "Success Sign Up, Please Login now", user}); // hanya masa develop untuk testing token
      res.status(200).json({ message: "Success Sign Up, Please Login now" }); // menampilkan data
    } catch (err) {
      //jika ada error
      res.status(400).json({ message: err.message });
    }
  },

  viewUser: async (req, res) => {
    try {
      const user = await User.find(); // mencari semua data
      user.length === 0 //handling jika panjang data samadengan 0 maka menampilkan not found jika ada akan menampilkan semua data {ternarity operator}
        ? res.status(404).json({ message: "User not found" })
        : res.status(200).json(user);
    } catch (err) {
      //jika ada error
      res.status(500).json({ message: err.message });
    }
  },

  updateUser: async (req, res) => {
    //console.log(req.body); //for testing

    const updates = Object.keys(req.body); //mengambil semua data yang di update
    const allowedUpdates = [
      //parameter key yang di perbolehkan
      "userName",
      "email",
      "role",
      "password",
      "passwordConfirm",
    ];
    const isValidOperation = updates.every(
      (
        update //mengecek apakah ada data update dari parameter di array allowedUpdate{parameter yang di perbolehkan}
      ) => allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      //jika tidak ada data update dari parameter di array allowedUpdate{parameter yang di perbolehkan}
      return res.status(403).json({ message: "invalid Key Praramaeter" });
    }

    try {
      const user = await User.findById(req.params.id); //mencari data id user .findById berasal dari mongose
      if (!user) {
        //jika user tidak ditemukan // TIDAK BISA BEKERJA
        return res.status(404).json({ message: "User not found" });
      }
      updates.forEach((update) => {
        //mengambil semua data dari input user request body
        user[update] = req.body[update];
      });

      await user.save(); //update data
      res.status(200).json(user); //menampilkan semua data yang di save
    } catch (err) {
      //error handling
      if (err.kind === "ObjectId") {
        //handling jika id user tidak ditemukan
        return res.status(404).json({ message: "User not found" });
      }
      res.status(500).json({ message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id); //mencari data id user dan delete .findByIdAndDelete berasal dari mongose
      user //jika id user ditemukan
        ? res.status(200).json({ message: "Success delete user", user }) //mencetak deleted jika berhasil
        : res.status(404).json({ message: "User not found" }); //mencetak not found jika gagal
    } catch (err) {
      //jika ada error
      res.status(500).json({ message: err.message });
    }
  },

  // function  authentication

  //login
  login: async (req, res) => {
    //console.log(req.body); //for testing
    try {
      const user = await User.findByCredentials(
        //login cek {function custom}
        req.body.email, // parameter email
        req.body.password // parameter password
      );

      const token = await user.generateAuthToken(); //generate token {function custom}
      const username = user.userName; //menampung data user dan di gunakan untuk menampilkan data di frontend

      res.status(200).json({ username, token }); //mengecek token dan username
    } catch (err) {
      //jika ada error
      res.status(400).json({ message: err.message });
    }
  },

  //logout
  logOut: async (req, res) => {
    //logout single device
    try {
      req.user.tokens = req.user.tokens.filter(
        //menghilangkan token dari user
        (token) => token.token !== req.user.token
      );

      await req.user.save();
      res.status(200).json({ message: "Logout Success" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  logOutAll: async (req, res) => {
    //logout all device
    try {
      req.user.tokens = []; //menghilangkan token
      await req.user.save();
      res.status(200).json({ message: "Logout Success" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  //menampilkan user yg sedang login
  viewMe: async (req, res) => {
    res.send(req.user);
  },
};
