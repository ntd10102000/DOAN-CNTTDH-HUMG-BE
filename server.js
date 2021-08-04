const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var path = require('path');
const session = require('express-session');

const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to bezkoder application." });
});


// set port, listen for requests
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: "duongnt-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 10000 * 60 * 5
    }
}));

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);