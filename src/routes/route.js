const express = require('express');
const router = express.Router();
const { createUser, userLogin } = require("../controllers/userController")
const { createBooks, getBooks, getBookById, updateBooks, deleteBooks, addBooks } = require("../controllers/booksController")
const { createReview,updateReview,deleteReview } = require('../controllers/reviewController')
const { authentication, authorisation, uploadFile} = require("../middleware/auth");


//========================= user apis ========================================================
router.post("/register", createUser)
router.post("/login", userLogin)



//========================= book apis =========================================================
router.post("/books", authentication, createBooks)
router.get("/books", authentication, getBooks)
router.get("/books/:bookId", authentication, getBookById)
router.put("/books/:bookId", authentication, authorisation, updateBooks)
router.delete("/books/:bookId", authentication, authorisation, deleteBooks)

//========================== Add book data in bulk=======================================//

router.post('/api/addBooks',addBooks)



//================================= review apis =================================================
router.post("/books/:bookId/review", createReview)
router.put("/books/:bookId/review/:reviewId", updateReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)



//======================== to check if the endpoint is correct or not =========================================
router.all("/**", function (req, res) {
    res.status(400).send({
        status: false,
        msg: "The api you are requesting is not available"
    })
})





module.exports = router;