const express = require('express'),
    app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies 



const aws = require('aws-sdk');
app.use(express.static('./public'));
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-1';

const routes = require('./routes/routes');
app.use('/', routes);




io.on('connection', function(socket) {
    socket.broadcast.emit('hi');
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    socket.on('ticketordered', function(ticket) {
        console.log('message: ' + ticket);
        io.emit('seatstakennow', { showing: ticket.showing, seats: ticket.seats });
        io.emit('seatstakennow2', { ticket:ticket });
    });
});


const port = process.env.PORT || 8080,
    ip = process.env.IP || '0.0.0.0';

http.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;