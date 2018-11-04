//  OpenShift sample Node application
var express = require('express'),
    app     = express();
var cors = require('cors');
var http = require('http').Server(app);
var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies 
//var io = require('socket.io')(http);
var db = require('./database/database');
var user = require('./usercontroller/usercontroller');


var upload= require('./upload/upload');
const aws = require('aws-sdk');
app.use(express.static('./public'));
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-1';

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



app.options('*', cors()) // include before other routes

app.get('/', function (req, res) {
res.send('Hello');
});




app.get('/showings', db.showings);
app.get('/showingsbydate/:date', db.showingsbydate);
app.get('/seatsshowing/:showingid', db.seatsshowing);
app.get('/seatstaken/:showingid', db.seatstaken);

app.post('/newticket',db.newticket);
app.post('/newshowing',db.newshowing);
app.post('/newfilm',db.newfilm);
app.post('/newprice',db.newprice);

app.post('/deleteshowing',db.deleteshowing);
app.post('/deletefilm',db.deletefilm);
app.post('/deleteprice',db.deleteprice);
app.post('/deleteticket',db.deleteticket);

app.post('/editfilm',db.editfilm);
app.post('/editcustomer',db.editcustomer);

app.get('/tickets', db.ticketsquery);
app.get('/rooms', db.roomsquery);
app.get('/prices', db.pricesquery);
app.get('/films', db.filmsquery);
app.get('/showingsquery', db.showingsquery);
app.post('/ticketsbycustomer',db.ticketsbycustomer);
//app.post('/upload',upload.upload);

app.get('/sign-s3', upload.signin);

app.get('/test', db.test);
//app.route('/newticket').post(user.loginRequired, db.newticket);

app.post('/registertest', user.register);
app.post('/logintest', user.login);
app.get('/memberinfo', user.memberinfo);
app.get('/customers',user.customers);
app.post('/deletecustomer',user.deletecustomer);

app.get('/hehe', function(req, res, next) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World lamusie!" + process.version);
});




// error handling
/*app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});*/
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

http.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
