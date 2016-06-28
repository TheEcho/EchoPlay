var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    mail: String,
    password: String,
    firstname: String,
    lastname: String,
    token: String,
});

module.exports = mongoose.model('User', schema);
