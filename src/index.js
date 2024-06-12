const express = require('express');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const app = express();
// const multer = require('multer');
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');



app.use(express.json());
app.use(bodyparser.urlencoded({extended:true}))
// app.use(multer().any());

app.use(fileUpload({parseNested: true}));

app.use('/static', express.static(path.join(__dirname, 'public')));
 




mongoose.connect("mongodb+srv://PrachiRakhonde:TidE9uPBxvyZRFOn@cluster0.vdm2ccj.mongodb.net/bookmanagement?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected on 27017"))
    .catch(err => console.log(err))



app.use('/', route);



app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
}) 