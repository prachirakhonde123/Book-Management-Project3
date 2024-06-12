const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;



const booksSchema = new mongoose.Schema(
    {
        _id : String,
        title: String,
        excerpt: String,
        ISBN: String,
        category: String,
        subcategory: String,
        reviews: Number,
        deletedAt: Date,
        isDeleted: {type : Boolean, default : false},
        releasedAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("book", booksSchema);