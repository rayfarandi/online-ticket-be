const Category = require("../models/Category");

module.exports = {
  addCategory: async (req, res) => {
    // console.log(req.body); //for testing

    const category = new Category({
      ...req.body, // ... = spread operator , mengambil semua data dari input user request body
    });

    try {
      await category.save();
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  viewCategory: async (req, res) => {
    try {
      const category = await Category.find(); //find berasal dari mongose
      category.length === 0
        ? res.status(404).json({ message: "Category not found" })
        : res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateCategory: async (req, res) => {
    //console.log(req.body); //for testing
    const updates = Object.keys(req.body);
    const allowedUpdates = ["categoryName"];
    const isValidaOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidaOperation) {
      return res.status(403).json({ message: "invalid Key Praramaeter" });
    }
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      updates.forEach((update) => {
        category[update] = req.body[update];
      });

      await category.save();
      res.status(200).json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      category
        ? res.status(200).json({ message: "Category deleted" })
        : res.status(404).json({ message: "Category not found" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
