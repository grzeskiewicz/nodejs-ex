var express = require('express'),
    app     = express();
var cors = require('cors');

var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies 

var db = require('../database/database');
var user = require('../usercontroller/usercontroller');
var upload= require('../upload/upload');


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

module.exports=app;