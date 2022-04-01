const chalk = require('chalk');
const { prompt } = require('inquirer');
const fs = require('fs');
const CONFIG_FILE = "./connection.conf";

//add localStorage - just to save authentification status
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

//checks if user is logged
function isLogged(){ 
 return localStorage.getItem('logged') == 'true';
}

//Authetification
function logIn(){
    if(isLogged()) return new Promise(resolve => resolve(true));

    const connData = JSON.parse(fs.readFileSync(CONFIG_FILE));
    return prompt([
    {
        type: 'input',
        name: 'user',
        message: 'User: ',
    },
    {
        type: 'password',
        name: 'password',
        message: 'Password: ',
    }
    ]).then((options)=>{
        let user = options.user,
            password = options.password;
        if(user != connData.user || password != connData.password){
           console.log(chalk.red(`\nIncorrect user name or password!`));
           localStorage.setItem('logged', false);
           return false;
        } 
        localStorage.setItem('logged', true);
        return true;
    }); 
}

//Logging out
function logOut(){
    localStorage.setItem('logged', false)
}

module.exports = {isLogged, logIn, logOut}
