var mongoose = require('mongoose');
var User     = require('./User.js');
var Schema   = mongoose.Schema;

var schema = new Schema({
    name: String,
    path: String,
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    recordFile: String
});

module.exports = mongoose.model('File', schema);
