const express = require('express');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const app = express();
const multer = require("multer")



app.use(express.json());




mongoose.connect("mongodb+srv://Group28_database:4tZ5x2HmbYcIlEwk@cluster0.p5ih0di.mongodb.net/Group28Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then(() => console.log("MongoDb is connected on 27017"))
.catch(err => console.log(err))

app.use(multer().any())


app.use('/', route);



app.listen(3000, function () {
    console.log('Express app running on port ' + (3000))
}) 