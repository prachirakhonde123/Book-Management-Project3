const moment = require('moment');
const fs = require('fs');
const fsp = fs.promises;
const {v4 : uuidv4} = require('uuid');

const uploadObj = {
    upload: async function (file) {
        try{
        if (file) {

            let file_extension = file.name.substr(file.name.lastIndexOf('.') + 1);
            
            let filename = uuidv4() + '-' + Date.now() + '.' + file_extension;
            let filePath = 'public/uploads/' +  filename;
            
            const uploaded = await fsp.writeFile(filePath, file.data);

            return {"download_link": "/static/uploads/" + filename};
        } 
    }catch(error){
        console.error(error.message);

    }
    },

    uploadExternal: async function (file) {
        try {
        if (file) {

            let file_extension = file.name.substr(file.name.lastIndexOf('.') + 1);
            
            let filename = uuidv4() + '-' + Date.now() + '.' + file_extension;
            let filePath = 'public/uploads/' +  filename;
            
            const uploaded = await fsp.writeFile(filePath, file.data);

            // return {"download_link": "/static/externalUploads/" + filename};
            return filePath;
        } 
    }catch(error){
        console.error(error.message);
      }
    },
}

module.exports = uploadObj