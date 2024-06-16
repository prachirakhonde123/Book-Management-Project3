const { default: mongoose } = require("mongoose")
const booksModel = require("../models/booksModel")
const reviewModel = require("../models/reviewModel")
const { isValid } = require("../validation/validator")
const uploadFile  = require("./uploadFile");
const fs = require('fs');
const csv = require('fast-csv');
const {parse} = require('csv-parse');
const {forEach} = require('p-iteration');
const {v4 : uuidv4} = require('uuid');



//------------------------------------- creating review --------------------------------------------------

const createReview = async function (req, res) {
    try {
        let data = req.body
        const bookId = req.params.bookId;
        data.bookId = bookId
        const { review, rating, reviewedBy } = data
        //=============================if invalid format of book id ===================================
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid Book Id" })
        }
        //======================== if body is empty ===============================================
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Body can't be empty! Provide Data to create review" })
        }
        //========================================= review is mandatory ==================================
        if (!review) {
            return res.status(400).send({ status: false, message: "Review is mandatory" })
        }
        //=================================== review is of in valid format =========================
        if (review) {
            if (!isValid(review)) return res.status(400).send({ status: false, message: "Review is in Invalid Format" })
            req.body.review = review.replace(/\s+/g, ' ')
        }
        //======================================= rating is mandatory ===================================
        if (!rating) {
            return res.status(400).send({ status: false, message: "Rating is mandatory" })
        }
        //========================= if rating is not of valid format ================================
        if (rating) {
            if (!(typeof rating == "number")) {
                return res.status(400).send({ status: false, message: "Rating should be a number" })
            }

            if (Number.isInteger(rating)) {
                if (rating < 1 || rating > 5) {
                    return res.status(400).send({ status: false, message: "Rating can only be 1,2,3,4,5" })
                }
            }
            else {
                return res.status(400).send({ status: false, message: "Rating can be only Integer and Whole Number" })
            }
        }
        //============================= if reviewedBy is not enter in the body ===========================
        if (!reviewedBy) {
            req.body.reviewedBy = "Guest"
        }

        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, message: "Your name is in Invalid Format" })
            }
            req.body.reviewedBy = reviewedBy.replace(/\s+/g, ' ')
        }
        //============================== if book not found using path param book id ==========================
        const book = await booksModel.findOne({ _id: bookId,isDeleted:false })
        if (!book) {
            return res.status(404).send({ status: false, message: "Book not found or deleted" })
        }

        //================================== creation of review ======================================
        const newReview = await reviewModel.create(data)
        const obj = {
            _id: newReview._id,
            bookId: newReview.bookId,
            reviewedBy: newReview.reviewedBy,
            reviewedAt: newReview.reviewedAt,
            rating: newReview.rating,
            review: newReview.review
        }
        const addReview = await booksModel.findOneAndUpdate({ _id: bookId ,isDeleted:false}, { $inc: { reviews: 1 } }, { new: true }).lean()

        // increment review count of book by 1
        //book.reviews += 1
        //await book.save();

        //================================== adding a new key to bookmodel data ============================
        addReview["reviewsData"] = obj

        return res.status(201).send({ status: true, message: "Review Added", data: addReview })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}








//========================================= review updation ===========================================

const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewid = req.params.reviewId
        let data = req.body
        const { review, rating, reviewedBy } = data
        //========================= invalid bookid format ====================================
        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid Format of BookId" })
        }
        //========================= invalid revieid format ==================================
        if (!mongoose.isValidObjectId(reviewid)) {
            return res.status(400).send({ status: false, message: "Invalid Format of ReviewId" })
        }
        //============================== if body is empty ====================================
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please provide data to update book review" })
        }
        //================================ if valid query is not made ==============================
        if (!(review || rating || reviewedBy)) {
            return res.status(400).send({ status: false, message: "Please enter Valid body to update review" })
        }

        //================================ if book not found ======================================
        let book = await booksModel.findOne({ _id: bookId }).lean()
        if (!book) {
            return res.status(404).send({ status: false, message: "Sorry! Book Not Found!" })
        }
        if (book.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Book is Deleted. You cannot add/update review" })
        }
        //=========================== if review not found ============================================
        let findreview = await reviewModel.findOne({ _id: reviewid })
        if (!findreview) {
            return res.status(404).send({ status: false, message: "Sorry! No such review found!" })
        }
        if (findreview.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Review is Deleted. You cannot update review" })
        }

        //=========================== invalid format of review ===================================
        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, message: "Review is in Invalid Format" })
            }
            req.body.review = review.replace(/\s+/g, ' ')
        }
        let reviews = req.body.review

        //========================= Validation to update Rating(Only between 1-5)==========================
        if (rating) {
            if (!(typeof rating == "number")) {
                return res.status(400).send({ status: false, message: "Rating should be a number" })
            }
            if (Number.isInteger(rating)) {
                if (rating < 1 || rating > 5) {
                    return res.status(400).send({ status: false, message: "Rating can only be 1,2,3,4,5" })
                }
            }
            else {
                return res.status(400).send({ status: false, message: "Rating can be only Integer and Whole Number" })
            }
        }

        //================================ Validation for reviewedBy ======================================
        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, message: "Your name is in Invalid Format" })
            }
            req.body.reviewedBy = reviewedBy.replace(/\s+/g, ' ')
        }
        let reviewedBys = req.body.reviewedBy

        //========================== Authorisation for book updation ===================================
        if (bookId != findreview.bookId) {
            return res.status(403).send({ status: false, message: "You cannot update review of others books" })
        }

        //============================= if authorised =============================================
        if (bookId == findreview.bookId) {
            let updateReview = await reviewModel.findOneAndUpdate({ _id: reviewid,isDeleted:false }, { review: reviews, rating: rating, reviewedBy: reviewedBys, reviewedAt: new Date() }, { new: true })
            book["reviewsData"] = updateReview
            res.status(200).send({ status: true, message: "BookReview is updated", data: book })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}








//=========================================== delete review ===========================================

const deleteReview = async function (req, res) {
    try {

        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        //============================== if bookid is of invalid format ================================
        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid Format of BookId" })
        }
        //================================ if reviewid is of invalid format ========================
        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "Invalid Format of ReviewId" })
        }
        //================================== if book is not found ==========================================
        let book = await booksModel.findOne({ _id: bookId })
        if (!book) {
            return res.status(404).send({ status: false, message: "Sorry! Book Not Found!" })
        }
        if (book.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Book is Deleted. You cannot delete review" })
        }
        //================================ if review is not found ======================================
        let findreview = await reviewModel.findOne({ _id: reviewId })
        if (!findreview) {
            return res.status(404).send({ status: false, message: "Sorry! No such review found!" })
        }
        if (findreview.isDeleted == true) {
            return res.status(400).send({ status: false, message: "Review is Deleted. You cannot delete review" })
        }

        //============================= authorisation for deletion ===================================
        if (bookId != findreview.bookId) {
            return res.status(403).send({ status: false, message: "You cannot delete review of other books" })
        }

        //================================ if authorised ==============================================
        if (bookId == findreview.bookId) {
            const deletereview = await reviewModel.findOneAndUpdate({ _id: reviewId ,isDeleted:false}, { isDeleted: true, })
            book.reviews -= 1
            await book.save();
            res.status(200).send({ status: true, message: "BookReview is Deleted" })
        }

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

//=================Create review for particular books======================================//

const createReviewinBulk = async function (req,res,next){
    let result = {}
    try {
        let data = [];

        if(!req.files){
            return res.json({
                status : false,
                message : "Provide File"
            })
        }

        let fileUploadPath = await uploadFile.uploadExternal(req.files.reviewFile);

        fs.createReadStream(fileUploadPath)
        .pipe(csv.parse({headers : true}))
        .on('error',error=> console.error(error))
        .on('data',row=> data.push(row))
        .on('end', async ()=> {
            await forEach(data, async (current)=>{
                let findBook = await booksModel.findOne({title : current.bookName})
                if(findBook){
                    let reviewData = {
                        _id : uuidv4(),
                        bookId : findBook._id,
                        reviewedBy : current?.reviewedBy ? current?.reviewedBy :  'Guest',
                        rating : current?.rating,
                        review : current?.review
                    }
                    let createReview = await reviewModel.create(reviewData);
                }else{
                    return res.json({
                        status : false,
                        message : "No book found."
                    })
                }
            })
        })

        return res.json({
            status : true,
            data : {fileUploadPath}
        })

    }
    catch(err){
       return res.json({
         status : false,
         message : err.message
       })
    }
}


//================= Fetch Book and review data ===========================//

const fetchReview = async function(req,res,next){
    let result = {}
    try{
        let reviewData = await reviewModel.aggregate(
            [
                {
                    $lookup : {
                        from: "books",
                        localField: "bookId",
                        foreignField: "_id",
                        as: "books"
                      }
                },
                {
                    $project : {
                        review :1,
                        reviewedBy:1,
                        rating :1,
                        "books.title" : 1,
                        "books.excerpt" : 1,
                        "books.ISBN" : 1,
                        "books.category" : 1
                      }
                }
            ]
        )

        // console.log('reviewData',reviewData)

        result = {
            status : true,
            data : reviewData
        }

    }
    catch(err){
        result = {
            status : false,
            message : err.message
        }
    }

    return res.json(result);
}







module.exports = { createReview, updateReview, deleteReview, createReviewinBulk, fetchReview }
