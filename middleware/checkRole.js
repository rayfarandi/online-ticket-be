// checkRole("admin","accounting")
const CheckRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) { //jika role user tidak sesuai, include roles disini adalah menembahkan beberapa role yg sesuai seperti ["admin","accounting"], dan dapat di tambahkan sesuai kebutuhan, untuk pengaksesan api
      return res.status(403).json({ message: "error forbidden role" });
    }

    next(); //jika role user sesuai
  };
};

module.exports = CheckRole;
