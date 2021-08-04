var pool_db = require("../config/crdb.config").pool_db;
var pg = require("pg");


exports.allAccess = (req, res) => {
    res.status(200).send(`Public Content.${req.session.User}`);
};

exports.userBoard = (req, res) => {
    console.log(req.session.User);
    var config_gis = {
        user: "postgres",
        database: req.session.User,
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
            client.query("SELECT * FROM geometry_columns", function(err, result, row) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query', err);
                } else {
                    result.addRow(row);
                    res.status(200).send(result.rows);
                }
            });
        }
    });
};

exports.showData = (req, res) => {
    var table_name_us = req.params.id;
    var config_gis = {
        user: "postgres",
        database: req.session.User,
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
            client.query("SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry FROM " + table_name_us + " As lg) As f) As fc", function(err, result, row) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query', err);
                } else {
                    result.addRow(row);
                    res.send(result.rows[0].row_to_json);
                }
            });
        }
    });
};

exports.adminBoard = (req, res) => {
    res.status(200).send(`Admin ${req.session.User}`);
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send(`Moderator Content.${req.session.User}`);
};

exports.apiTopData = (req, res) => {
    if (req.session.User != null) {

    } else {
        res.redirect("/user/login");
    }
};