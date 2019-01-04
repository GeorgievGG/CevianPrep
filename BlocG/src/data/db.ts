var {connect, connection} = require('mongoose'); 

var dbURI = 'mongodb://sa:125634ab@ds127704.mlab.com:27704/blocg'; 

connect(dbURI); 

connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

connection.on('error',function (err: Error) {  
  console.log('Mongoose default connection error: ' + err);
}); 

connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

process.on('SIGINT', function() {  
  connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
}); 

require('../models/user');  