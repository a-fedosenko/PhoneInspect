const ph = require("libphonenumber-js");

//inspect logs for incorrect numbers
function inspect(logs){
    //flatten log data to 'from' numbers
    logs.map((obj)=>{
        let phone = obj.data.split(';')[1].split(':')[1];
        obj.data = phone;
    })

    //check numbers
    let ids = new Set();
    for(let log of logs){
        if(!checkPhone(log.data)) ids.add(log.id);
    }    
    return ids;
}

//check if phone is possible and valid
function checkPhone(phone){
    if(!ph.isPossiblePhoneNumber(phone, 'US')) return false;
    if(!ph.isValidPhoneNumber(phone, 'US')) return false;
    return true;
 }

module.exports = {inspect}
