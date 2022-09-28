const express = require('express');
const router = express.Router();
const { createUser, userLogin } = require("../controllers/userController")
const { createBooks, getBooks, getBookById, updateBooks, deleteBooks } = require("../controllers/booksController")
const { createReview,updateReview,deleteReview } = require('../controllers/reviewController')
const { authentication, authorisation } = require("../middleware/auth");
const aws = require("aws-sdk");




//========================= user apis ========================================================
router.post("/register", createUser)
router.post("/login", userLogin)


//========================= aws link creation ===================================================


aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "group28/" + file.originalname,
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ error: err })
            }
            //console.log(data)
            console.log("file uploaded sucessfully")
            return resolve(data.Location)
        })
    })

}


router.post('/aws-file-uploading', async function (req, res) {
    try {
        let files = req.files
        //console.log(typeof files)
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            res.status(201).send({ msg: "file uploaded sucessfully", data: uploadedFileURL })
        }
        else {
            res.status(400).send({ msg: "no file found" })
        }

    }
    catch (err) {
        res.status(500).send({ msg: err.message })
    }
}
)

//========================= book apis =========================================================
router.post("/books", authentication, createBooks)
router.get("/books", authentication, getBooks)
router.get("/books/:bookId", authentication, getBookById)
router.put("/books/:bookId", authentication, authorisation, updateBooks)
router.delete("/books/:bookId", authentication, authorisation, deleteBooks)



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