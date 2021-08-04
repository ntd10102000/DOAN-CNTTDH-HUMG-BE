const db = require("../models");
var pool_db = require("../config/crdb.config").pool_db;
var pg = require("pg");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // Save User to Database
    User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8)
        })
        .then(user => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles
                        }
                    }
                }).then(roles => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User was registered successfully!" });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully!" });
                });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        }).then(pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error");
            } else {
                client.query("CREATE DATABASE " + req.body.username, function(err, result) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    }
                    console.log("tao database thanh cong");
                    var config_gis = {
                        user: "postgres",
                        database: req.body.username,
                        password: "nguyentienduong1",
                        host: "localhost",
                        port: "5432",
                        max: 10,
                        idleTimeoutMillis: 30000
                    };
                    var pool_gis = new pg.Pool(config_gis);
                    pool_gis.connect(function(err, client, done) {
                        if (err) {
                            return console.log("error:" + err);
                        } else {
                            client.query("create extension postgis", function(err, result) {
                                done();
                                if (err) {
                                    res.end();
                                    return console.error('error running query', err);
                                }
                                console.log("tao postgis thanh cong");

                            });
                        }
                    });
                });

            }
        })).catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    User.findOne({
            where: {
                username: req.body.username
            }
        })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }
            req.session.User = req.body.username;

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            var authorities = [];
            user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }

                res.status(200).send({
                    id: user.id,
                    username: req.session.User,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            });

        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};