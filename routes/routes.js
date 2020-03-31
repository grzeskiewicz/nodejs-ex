var express = require('express'),
    app = express();
var cors = require('cors');

var bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies 

var db = require('../database/database');
var user = require('../usercontroller/usercontroller');
var upload = require('../upload/upload');


app.options('*', cors()) // include before other routes


app.get('/showings', db.showings);
app.get('/showingsbydate/:date', db.showingsbydate);
app.get('/seatsshowing/:showingid', db.seatsshowing);
app.get('/seatstaken/:showingid', db.seatstaken);

app.post('/newticket', db.newticket);
app.post('/newshowing', db.newshowing);
app.post('/newfilm', db.newfilm);
app.post('/newprice', db.newprice);

app.post('/deleteshowing', db.deleteshowing);
app.post('/deletefilm', db.deletefilm);
app.post('/deleteprice', db.deleteprice);
app.post('/deleteticket', db.deleteticket);

app.post('/editfilm', db.editfilm);
app.post('/editcustomer', db.editcustomer);

app.get('/tickets', db.ticketsquery);
app.get('/rooms', db.roomsquery);
app.get('/prices', db.pricesquery);
app.get('/films', db.filmsquery);
app.get('/showingsquery', db.showingsquery);
app.post('/ticketsbycustomer', db.ticketsbycustomer);
app.post('/sendtickets', db.sendtickets);
//app.post('/upload',upload.upload);

app.get('/sign-s3', upload.signin);

app.get('/test', db.test);
//app.route('/newticket').post(user.loginRequired, db.newticket);

app.post('/registertest', user.register);
app.post('/logintest', user.login);
app.get('/memberinfo', user.memberinfo);
app.get('/customers', user.customers);
app.post('/deletecustomer', user.deletecustomer);



/* PASSPORT SETUP */
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


app.get('/success', (req, res) => {
    //console.log(passport);

    res.send("You have successfully logged in");

});
app.get('/error', (req, res) => res.send("error logging in"));
passport.serializeUser(function (user, cb) {
    // console.log(user);
    cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


/* FACEBOOK AUTH */
const FacebookStrategy = require('passport-facebook').Strategy;
const FACEBOOK_APP_ID = '255080745147654';
const FACEBOOK_APP_SECRET = 'fcce20e07201bd900e9d465e69f29f0e';
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        //console.log(profile.displayName);
        return cb(null, profile);
    }
));
app.get('/auth/facebook',
    passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/error' }),
    function (req, res) {
        res.redirect(`/success`);
    });



module.exports = app;