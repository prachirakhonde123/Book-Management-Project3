const aws = require("aws-sdk");
//Aws Cofiger


aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1",
});

//using Upload fike Function

var uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket", //HERE
            Key: "group28/" + file.originalname, //HERE
            Body: file.buffer,
        };

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ error: err });
            }
            console.log(data);
            console.log("file uploaded succesfully");
            return resolve(data.Location);
        })
    })
}

createCover = async function (req, res) {
    try 
    {
        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL });
        }
        else {
            res.status(400).send({ msg: "No file found" });
        }
    } 
    
    catch (err) {
        res.status(500).send({ msg: err });
    }
};

module.exports = {createCover}

