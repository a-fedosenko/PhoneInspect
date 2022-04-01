const mysql = require("mysql2");
const { prompt } = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const { resourceLimits } = require("worker_threads");
const CONFIG_FILE = "./connection.conf";

//connects to database 
function dbconnect(){
    const connData = JSON.parse(fs.readFileSync(CONFIG_FILE));
    return mysql.createConnection({
      host: connData.host,
      database: connData.database,
      user: connData.user,
      password: connData.password
    });     
}

//check connection - for testing only
function checkConnection(){
    return function(err){
        if (err) {
          return console.error(chalk.red("Error: " + err.message));
        } else{
          console.log(chalk.green("You are connected to the server!"));
          process.exit(0)
        }  
    }
}

//execute single query
function execQuery(connection, query_string, options, print = true){
    return function(err) {
        if (err) {
            return console.error(chalk.red("Error: " + err.message));
        } else{ 
            if('args' in options) options = options.args.split(",");      
            connection.query(query_string, options, function (err, result, fields) {
                if (err) throw err;
                if(print){
                    console.log(result);
                    process.exit(0);                   
                } else {
                    return result;
                }
            })  
        }
    }
}

//process single query from file
function processFile(connection, input_path, output_path, last_file = true){
    let query_string = fs.readFileSync(input_path, 'utf8');
    query_string = query_string.trim();    
    if(!query_string.toLowerCase().startsWith("select")) {
        return console.error(chalk.red("Error: Incorrect query!"));   
    }

    console.log(query_string)
    return function(err) {
        if (err) {
            return console.error(chalk.red("Error: " + err.message));
        } else{        
            connection.query(query_string, function (err, result, fields) {
                if (err) throw err;
                let count = result[0].count;
                console.log(count)
                let text = `
                Query: ${query_string}
                Result: ${count}
                `
                fs.writeFileSync(output_path, text);
                if(last_file) process.exit(0);
            })  
        }
    }
}

//process all files in derectory
function processDirectory(connection, input_dir, output_dir){
    fs.readdir(input_dir, function (err, files) {
        if (err) {
            return console.log(chalk.red('Error: ' + err));
        } 
        
        files.forEach(function (file) {
            let input_path = input_dir + "/" + file;
            let output_path = output_dir + "/" + "result_" + file;
            connection.connect(processFile(connection, input_path, output_path, file == files[files.length-1]));
        });
    });
}

//get calldata logs 
async function getAllLogs(connection, plan){
    let options = [plan],
        query_string = fs.readFileSync("./queries/inspector.txt", 'utf8');
    const [result, fields] = await connection.promise().query(query_string, options);
    return result;
}

module.exports = {dbconnect, checkConnection, execQuery, 
                processFile, processDirectory, getAllLogs}