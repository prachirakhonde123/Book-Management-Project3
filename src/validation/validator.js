const moment = require('moment');
const fs = require('fs');
const {v4 : uuidv4} = require('uuid');


const isValidBody = function (data) {
  return Object.keys(data).length > 0;
};




const isValid = function (value) {
  if (typeof value !== "string")   return false
  if (typeof value === 'string' && value.trim().length === 0) return false        
  return true;
};



const isValidEmail = function (mail) {
  if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false
};



const isValidPassword = function (pass) {
  if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(pass)) return true;
  return false
};



const isValidName = function (name) {
  if (/^[A-Za-z\s]{1,35}$/.test(name)) return true
  return false
};




const isvalidPhone = function (mobile) {
  if (/^(\+91[\-\s]?)?[0]?[789]\d{9}$/.test(mobile)) return true
  return false
};



const isvalidPincode = function (pincode) {
  if (/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(pincode)) return true
  return false
};


const isValidDate = function (date) {
  if (typeof date != "string") return false
  return moment(date, 'YYYY-MM-DD', true).isValid()
}


const isValidISBN13 = function (ISBN) {
  if (/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) return true;
  return false
}

const uploadExternal = async function(file){
  console.log('etreytey',file)
  if(file){
    let fileExtension = file.name?.substr(file.name.lastIndexOf('.')+1);
    console.log('file extension',fileExtension);
    let fileName = uuidv4() + '-' + Date.now() + '.' + fileExtension;
    // console.log('filename',fileName)
    let filePath = 'public/uploads/' + fileName;
    // console.log('filePath',filePath);
    let uploaded = await fs.writeFile(filePath, file.data);
    return filePath;
  }
}





module.exports = { isValidEmail, isValidName, isValidBody, isValidPassword, isvalidPhone, isvalidPincode,isValidDate ,isValidISBN13,isValid, uploadExternal};
