const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;



const reviewSchema = new mongoose.Schema({
    _id : String,
    bookId: {
        type: String,
        ref: "book"
    },
    reviewedBy: {
        type: String,
        default: 'Guest',
    },
    rating: {
        type: Number,
    },
    review: {
        type : String,
        trim : true
    },
},
    { timestamps: true });




module.exports = mongoose.model('review', reviewSchema)