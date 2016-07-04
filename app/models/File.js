var mongoose = require('mongoose');
var User     = require('./User.js');
var Schema   = mongoose.Schema;

var schema = new Schema({
    name: String,
    ext: String,
    icon: String,
    path: String,
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('File', schema);
