// server.js

var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var settings = require('./config/settings.js');
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

mongoose.connect(settings.dburl);

app.use(express.static(__dirname + '/client'));
app.use('/media', express.static(__dirname + '/media'));
app.use(morgan('dev'));
app.use(bodyParser.json({ type: 'application/json', limit: '20gb' }));
app.use(bodyParser.urlencoded({limit: '20gb', extended: 'true', type:'application/x-www-form-urlencoding'}));
app.use(methodOverride());
app.set('superSecret', settings.secret);
app.set('mediaFilePath', __dirname + '/media/');
app.set('indexPath', __dirname + '/client/');
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
require('./app/routes.js')(app);

app.listen(settings.port);
console.log('App listening on port ' + settings.port);
