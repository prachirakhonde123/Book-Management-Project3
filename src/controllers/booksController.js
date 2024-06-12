const reviewModel = require("../models/reviewModel")
const booksModel = require("../models/booksModel")
const userModel = require('../models/userModel')
const { isValidDate, isValidISBN13, isValid, isValidBody, uploadExternal } = require("../validation/validator");
const mongoose = require('mongoose')
const csv = require('fast-csv');
const {parse} = require('csv-parse')
const xlsx = require('xlsx');
const fs = require('fs');
const {forEach} = require('p-iteration');
const {v4 : uuidv4} = require('uuid');
const uploadFile = require('./uploadFile');
// const multer = require('multer');




const stringRegex = /^[ a-z ]+$/i



//====================================== creating books ===================================================

const createBooks = async function (req, res) {
    try {
        let requestBody = req.body;
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestBody

        //========================= if body data is not present =======================================

        if (!isValidBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Body can't be empty! Please Provide Data" })
        }

        //========================== Validation for Title======================================================
        if (!title) {
            return res.status(400).send({ status: false, message: "Title is required" })
        };

        if (title) {
            if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is in Invalid Format" })

            req.body.title = title.replace(/\s+/g, ' ')
        }

        //============================== if title already exist =====================================

        let checkTitle = await booksModel.findOne({ title: title })
        if (checkTitle) {
            return res.status(400).send({ status: false, message: "Title already used" })
        }

        //============================ Validation for Excerpts =========================================
        if (!excerpt) {
            return res.status(400).send({ status: false, message: "excerpt is required" })
        };

        if (excerpt) {
            if (!isValid(excerpt)) return res.status(400).send({ status: false, message: "Excerpt is in Invalid Format" })

            req.body.excerpt = excerpt.replace(/\s+/g, ' ')
        }



        //================================= userId is mandatory =====================================
        if (!userId) {
            return res.status(400).send({ status: false, message: "userId is required" })
        };

        //=============================== invalid format of userId =================================

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "invalid userId format" });
        }

        //=============================== if userId is not found ======================================

        let checkuserId = await userModel.findOne({ userId: userId })
        if (!checkuserId) {
            return res.status(400).send({ status: false, message: "userId not found" })
        }

        //========================= if the user is unauthorised to create data =======================
        if (userId != req.token) {
            return res.status(403).send({ status: false, message: "Unauthorized access ! User's credentials do not match." })
        }

        //======================== ISBN is mandatory ===========================================
        if (!ISBN) {
            return res.status(400).send({ status: false, message: "ISBN is required" })
        };
        //======================== invalid format of ISBN =======================================
        if (!isValidISBN13(ISBN)) {
            return res.status(400).send({ status: false, message: "Please provide correct format for ISBN" })
        };
        //================================ if ISBN already exist =====================================
        let checkISBN = await booksModel.findOne({ ISBN: ISBN })
        if (checkISBN) {
            return res.status(400).send({ status: false, message: "ISBN already used" })
        }
        //=================================== category is mandatory ==============================
        if (!category) {
            return res.status(400).send({ status: false, message: "category is required" })
        };

        if (!category.match(stringRegex)) {
            return res.status(400).send({ status: false, message: "category cannot contain numbers" })
        };

        if (category.match(stringRegex)) {
            let newcategory = category.toLowerCase()
            requestBody.category = newcategory
        }

        //=============================== subcategory is mandatory =============================
        if (!subcategory) {
            return res.status(400).send({ status: false, message: "subcategory is required" })
        };

        if (!subcategory.match(stringRegex)) {
            return res.status(400).send({ status: false, message: "category cannot contain numbers" })
        };

        if (subcategory.match(stringRegex)) {
            let newsubcategory = subcategory.toLowerCase()
            requestBody.subcategory = newsubcategory
        }


        //============================ releasedAt is mandatory ====================================
        if (!releasedAt) {
            return res.status(400).send({ status: false, message: "releasedAt is required" })
        };

        if (!isValidDate(releasedAt)) {
            return res.status(400).send({ status: false, message: "releasedAt is in incorrect format (YYYY-MM-DD)" })
        }


        //============================== createing books ============================================
        const newBook = await booksModel.create(requestBody);
        return res.status(201).send({ status: true, message: "Book created successfully 👍🏻", data: newBook })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//==========================Add data in bulk========================================//

const addBooks = async function(req,res){
    let result = {};
    try{
        let data = [];
        // console.log('req.files',req.files)
        if(!req.files){
           return res.json({
            status : false,
            message : "Provide File"
           }) 
        }
        // console.log('req.files',req.files.myFile)
        let fileUploadPath = await uploadFile.uploadExternal(req.files.myFile);
        console.log('fileupload',fileUploadPath)
        fs.createReadStream(fileUploadPath).pipe(csv.parse({headers:true}))
        .on('error', error => console.error(error))
        .on('data', row => data.push(row))
        .on('end', async ()=>{
            console.log('data',data)
            await forEach(data,async (current) => {
                // console.log('current',current);
               let addData = {
                   _id : uuidv4(),
                   title : current.title,
                   excerpt : current.excerpt,   
                   ISBN : current.isbn,
                   category : current.category, 
                   reviews : current.reviews,
                   isDeleted : false,
               }
               console.log('addData.....................',addData)

               let addData2 = await booksModel.create(addData);
            })
        })

        result = {
            success : true,
            data : {fileUploadPath}
        }
    }
    catch(err){
       result = {
        success : false,
        message : err.message,
       }
    }
    res.json({result})
    return result;
}








//=================================== geting books data using query params ==================================

const getBooks = async function (req, res) {
    try {
        const queryParams = req.query
        let { userId, category, subcategory } = queryParams

        //========================== if query are not entered ==========================================

        if (Object.keys(queryParams).length == 0) {
            const notdeletedBooks = await booksModel.find({ isDeleted: false }).sort({ title: 1 }).select('_id title excerpt userId category releasedAt reviews')
            notdeletedBooks.sort((a, b) => a.title.localeCompare(b.title))
            return res.status(200).send({ status: true, message: "non deleted books", data: notdeletedBooks })
        }
        //=================== if Invalid Query is Given ==================================================

        if (!(userId || category || subcategory)) {
            return res.status(400).send({ status: false, message: "enter valid query to get data" })
        }
        //================================== if userId is of invalid format =============================
        if (userId) {
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).send({ status: false, msg: "invalid userId format" });
            }
        }
        //=======================================changing category to lowercase==========
        if (category) {
            let newcategory = category.toLowerCase()
            queryParams.category = newcategory
        }
        //==============================changing subcategory to lowercase==========================

        if (subcategory) {
            let newsubcategory = subcategory.toLowerCase()
            queryParams.subcategory = newsubcategory
        }
        //=============================== finding books in DB ================================

        const books = await booksModel.find({ $and: [{ ...queryParams }, { isDeleted: false }] }).sort({ title: 1 }).select('_id title excerpt userId category releasedAt reviews')
        books.sort((a, b) => a.title.localeCompare(b.title))

        //============================ if book is not found ===========================================
        if (books.length === 0) {
            return res.status(404).send({ status: false, message: "Books not found" })
        }
        return res.status(200).send({ status: true, message: "Books list", data: books })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
}







//=================================== get books by path params ========================================

const getBookById = async function (req, res) {
    try {
        const bookid = req.params.bookId
        //========================== invalid format of bookid =========================================
        if (!mongoose.Types.ObjectId.isValid(bookid)) {
            return res.status(400).send({ status: false, message: "Invalid Book Id" })
        }
        const book = await booksModel.findOne({ _id: bookid, isDeleted: false }).lean()
        //=================== if books are not found ============================================
        if (!book) {
            return res.status(404).send({ status: false, message: "Sorry! No book found Or Book may be deleted" })
        }

        let review = await reviewModel.find({ bookId: bookid, isDeleted: false }).select("_id bookId reviewedBy reviewedAt rating review")
        // const bookData = book._doc //=book.toJSON()//=book.toObject()
        // bookData["reviewsData"]=review
        book["reviewsData"] = review

        return res.status(200).send({ status: true, message: "Book List", data: book })
    }

    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }

}








//========================================== update books =====================================================

const updateBooks = async function (req, res) {
    try {
        const bookId = req.params.bookId
        let { title, excerpt, releasedAt, ISBN } = req.body

        //=========================== if bodydata is empty =======================================

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Body cannot be empty" })
        }

        //==============================Providing Invalid key and data from body============================

        if (!(title || excerpt || releasedAt || ISBN)) {
            return res.status(400).send({ status: false, message: "Invalid key to update Book." })
        }

        //============================== if title already exist =====================================

        if (title) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "Title is in Invalid Format" })
            }
            req.body.title = title.replace(/\s+/g, ' ')// Assigned proper value in titles           
        }
        let titles = req.body.title

        let checkTitle = await booksModel.findOne({ title: titles })
        if (checkTitle) {
            return res.status(400).send({ status: false, message: "Title already used" })
        }

        //======================== invalid format of ISBN =======================================
        if (ISBN) {
            if (!isValidISBN13(ISBN)) {
                return res.status(400).send({ status: false, message: "Please provide correct format for ISBN" })
            };
        }
        //================================ if ISBN already exist =====================================
        let checkISBN = await booksModel.findOne({ ISBN: ISBN })
        if (checkISBN) {
            return res.status(400).send({ status: false, message: "ISBN already used" })
        }
        //============================== valid format of releasedAt ====================================
        if (releasedAt) {
            if (!isValidDate(releasedAt)) {
                return res.status(400).send({ status: false, message: "releasedAt is in incorrect format (YYYY-MM-DD)" })
            }
        }
        //========================== check of book is deleted or not =======================================
        const findBook = await booksModel.findOne({ _id: bookId, isDeleted: false })
        if (findBook) {
            const updateBooks = await booksModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { title: titles, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }, { new: true })
            return res.status(200).send({ status: true, message: "Book updated", data: updateBooks })
        }
        else {
            return res.status(404).send({ status: false, message: "Book already deleted" })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}






//==================================== delete books =================================================
const deleteBooks = async function (req, res) {
    try {
        const booksId = req.params.bookId

        let book = await booksModel.findOne({ _id: booksId, isDeleted: false })
        if (book) {
            const deleteBook = await booksModel.findOneAndUpdate({ _id: booksId }, { isDeleted: true, deletedAt: new Date() })
            return res.status(200).send({ status: true, message: "Book deleted successfully" })
        }
        else {
            return res.status(404).send({ status: false, message: "Book already Deleted" })
        }

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}





module.exports = { createBooks, getBooks, getBookById, updateBooks, deleteBooks, addBooks }







//{ userId : userId, "category" : {$regex : `${category}`, $options : "i"}, "subcategory" : {$regex : `${subcategory}`,$options : "i"}