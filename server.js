var express = require('express'),
    app     = express();
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies 



const aws = require('aws-sdk');
app.use(express.static('./public'));
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-1';

const routes = require('./routes/routes');
app.use('/', routes);

//var jwt = require('jsonwebtoken');    
/*app.use(function(req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
   // res.header("Access-Control-Allow-Headers","Content-Type");
   //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
            if (err) req.user = undefined;
            req.user = decode;
            console.log(req);
            next();
        });
    } else {
        console.log("BRAK TOKENIKA");
        req.user = undefined;
        next();
    } 
});*/





io.on('connection', function(socket) {
    socket.broadcast.emit('hi');
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('ticketordered', function(msg) {
        console.log('message: ' + msg);
        io.emit('seatstakennow', msg);
    });
});


var port = process.env.PORT || 8080,
    ip   = process.env.IP   || '0.0.0.0';

http.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
