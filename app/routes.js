// app/routes.js

var User       = require('./models/User.js');
var File       = require('./models/File.js');
var express    = require('express');
var path       = require('path');
var fs         = require('fs');
var glob       = require('glob');
var jwt        = require('jsonwebtoken');
var formidable = require('formidable');

module.exports = function (app) {
    var mainRouter = express.Router();

    mainRouter.get('/', function (req, res) {
        res.sendFile(app.get('indexPath') + 'index.html');
    });

    mainRouter.post('/authenticate', function (req, res) {
        User.findOne({mail: req.body.mail}, function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({ success: false, data: 'Authentication failed. User not found.' });
            } else if (user) {
                if (user.password != req.body.password) {
                    res.json({ success: false, data: 'Authentication failed. Wrong password.' });
                } else {
                    res.json({
                        success: true,
                        user: user,
                        token: user.token
                    });
                }
            }
        });
    });

    mainRouter.post('/signin', function (req, res) {
        User.findOne({mail: req.body.mail}, function (err, user) {
            if (err) {
                res.json({
                    success: false,
                    data: "Error occured: " + err
                });
            } else {
                if (user) {
                    res.json({
                        success: false,
                        data: "User already exists!"
                    });
                } else if (req.body.firstPassword != req.body.secondPassword) {
                    res.json({
                        success: false,
                        data: "Password doesn't match!"
                    });
                } else {
                    var userModel = new User();
                    userModel.mail = req.body.mail;
                    userModel.password = req.body.firstPassword;
                    userModel.firstname = req.body.firstname;
                    userModel.lastname = req.body.lastname;
                    userModel.save(function (err, user) {
                        user.token = jwt.sign(user, app.get('superSecret'));
                        user.save(function (err, user1) {
                            res.json({
                                success: true,
                                user: user,
                                token: user1.token
                            });
                        });
                    })
                }
            }
        });
    });

    mainRouter.use(function (req, res, next) {
        var tmp = req.headers['authorization'] || req.body.token || req.query.token;
        if (typeof tmp !== 'undefined') {
            var token = tmp.split(' ')[1];
            jwt.verify(token, app.get('superSecret'), function (err, token) {
                if (err) {
                    return res.json({
                        success: false,
                        data: 'Failed to authenticate token.'
                    });
                } else {
                    req.token = token;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                success: false,
                data: 'No token provided.'
            });
        }
    });

    mainRouter.get('/home', function (req, res) {
        User.findOne({_id: req.token._doc._id}, function (err, user) {
            if (err) {
                res.json({
                    success: false,
                    data: "Error occured: " + err
                });
            } else {
                dir = app.get('mediaFilePath') + user._id + '/';
                if (!fs.existsSync(dir)) {fs.mkdirSync(dir);}
                File.find({user: user}, function (err, files) {
                    if (err) {
                        res.json({
                            success: false,
                            data: "Error occured: " + err
                        });
                    } else {
                        res.json({
                            success: true,
                            data: files,
                            userid: user._id
                        });
                    }
                })
            }
        });
    });

    mainRouter.post('/upload', function (req, res) {
        User.findOne({_id: req.token._doc._id}, function (err, user) {
            if (err) {
                res.json({
                    success: false,
                    data: "Error occured: " + err
                });
            } else {
                dir = app.get('mediaFilePath') + user._id + '/';
                if (!fs.existsSync(dir)) {fs.mkdirSync(dir);}
                var form = new formidable.IncomingForm();
                form.multiples = true;
                form.uploadDir = dir;
                form.on('file', function (field, file) {
                    fs.rename(file.path, path.join(form.uploadDir, file.name));
                    var FileModel = new File();
                    FileModel.name = file.name;
                    FileModel.ext = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);
                    if (FileModel.ext == 'mp4' || FileModel.ext == 'ogg' || FileModel.ext == 'webm') {
                        FileModel.icon = 'movie';
                    }
                    else if (FileModel.ext == 'mp3' || FileModel.ext == 'wav') {
                        FileModel.icon = 'music_note';
                    }
                    else if (FileModel.ext == 'png' || FileModel.ext == 'jpeg' || FileModel.ext == 'jpg' || FileModel.ext == 'gif') {
                        FileModel.icon = 'image';
                    }
                    else {
                        FileModel.icon = 'insert_drive_file';
                    }
                    FileModel.path = dir;
                    FileModel.user = user;
                    FileModel.save(function (err, file1) {});
                });
                form.on('error', function (err) {
                    console.log('An error has occured: \n' + err);
                });
                form.on('end', function () {
                    res.json({
                        success: true,
                        data: "File uploaded successfuly"
                    });
                });
                form.parse(req);
            }
        });
    });

    mainRouter.post('/delete', function (req, res) {
        User.findOne({_id: req.token._doc._id}, function (err, user) {
            dir = app.get('mediaFilePath') + user._id + '/';
            File.remove({_id: req.body.id}, function (err) {
                if (err) throw err;
                fs.unlink(dir + req.body.name, function (err) {
                    res.json({
                        success: true,
                        data: "All files has been deleted successfuly"
                    });
                });
            });
        });
    });

    app.use('/', mainRouter);
};
