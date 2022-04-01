#!/usr/bin/env node

//load external modules
const mysql = require("mysql2");
const commander = require('commander');
const { prompt } = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');

//load internal modules
const lg = require('./loginutils');
const db = require('./dbutils');
const inspector = require("./inspect.js");

//version
commander
  .version('1.0.0')
  .description('MySQl query processor')

//Check connection 
commander
  .command('check')
  .alias('c')
  .description('Check connection session.')
  .action(() => {
    lg.logIn().then((resp)=>{
      if(!resp) process.exit(1);
      connection = db.dbconnect(); 
      connection.connect(db.checkConnection());
    });
}) 

//Logout
commander
  .command('exit')
  .alias('x')
  .description('Log out')
  .action(() => {
      lg.logOut();    
});

//Process single query
commander
  .command('query <query_string>')
  .option('-a, --args <values>', "Comma separated arguments for placeholders")
  .alias('q')
  .description('Process single query')
  .action((query_string, options) => {
    lg.logIn().then((resp)=>{
      if(!resp) process.exit(1);
      connection = db.dbconnect();
      console.log(options)
      connection.connect(db.execQuery(connection, query_string, options));      
    });
}); 

//Process single file
commander
  .command('file <input_path> <output_path>')
  .alias('f')
  .description('Process single file')
  .action((input_path, output_path) => {
    lg.logIn().then((resp)=>{
      if(!resp) process.exit(1);
      connection = db.dbconnect();
      connection.connect(db.processFile(connection, input_path, output_path));
    });
}); 

//Process all files in directory
commander
  .command('dir <input_dir> <output_dir>')
  .alias('d')
  .description('Process all files in directory')
  .action((input_dir, output_dir) => {
    lg.logIn().then((resp)=>{
      if(!resp) process.exit(1);
      connection = db.dbconnect();
      db.processDirectory(connection, input_dir, output_dir);
    });
}); 

//Inspect all logs for incorrect phone numbers
commander
  .command('inspect <plan>')
  .alias('i')
  .description('Inspect all logs for incorrect phone numbers')
  .action((plan) => {
    lg.logIn().then(async (resp)=>{
      if(!resp) process.exit(1);
 
      connection = await db.dbconnect();
      let logs = await db.getAllLogs(connection, plan);
      let ids = inspector.inspect(logs);

      console.log(chalk.green('All logs reviewed!'));
      if(ids.size>0) console.log(chalk.red('Found errors!'));

      let text = [...ids].join(',\n');
      fs.writeFileSync("./results/inspector_log.txt", text);
      process.exit(0);
    });
}); 

//parse commands
commander.parse(process.argv);