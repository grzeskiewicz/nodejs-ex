const mysql = require('mysql')
const async = require("async");
const moment = require('moment');
const fs = require('fs');
const PDFDocument = require('pdfkit')
const { Client } = require('pg');
//const mailConfig = require('../mailConfig.js');


const nodemailer = require('nodemailer');

//const transporter = nodemailer.createTransport(mailConfig.config);

/*
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cinemanode@gmail.com',
        pass: 'Cinema123'
    }
});*/





function newClient() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });

    client.connect();
    return client;
}




const test = function (req, res) {
    const client = newClient();

    client.query("SELECT s.id,f.title,f.director,f.genre,f.length,f.category,f.imageUrl,p.normal, p.discount,r.id as room,r.seats,date from showings s, prices p, rooms r, films f WHERE s.film=f.id AND s.room=r.id AND s.price=p.id", (err, result) => {
        if (err) throw err;
        res.json(result);
        client.end();
    });
}






const showings = function (req, res) {
    const connection = newClient();
    connection.query("select s.id,f.title,f.director,f.genre,f.length,f.category,f.imageUrl,p.normal, p.discount,r.id as room,r.seats,date from showings s, prices p, rooms r, films f where s.film=f.id AND s.room=r.id AND s.price=p.id ", function (err, rows) {
        if (err) res.json(err);

        res.json(rows.rows);
        connection.end();
    });
}


const showingsbydate = function (req, res) {
    const connection = newClient();
    connection.query('select s.id,f.title,f.director,f.genre,f.length,f.category,f.imageUrl,p.normal, p.discount,r.id as room,r.seats,date from showings s, prices p, rooms r, films f where s.film=f.id AND s.room=r.id AND s.price=p.id AND date::text LIKE ' + "'" + req.params.date + "%'", function (err, rows) {
        if (err) throw err

        res.json(rows.rows);
        connection.end();
    });

}


const seatsshowing = function (req, res) {
    const connection = newClient();
    connection.query("select r.seats from showings s, rooms r where r.id=s.room AND s.id='" + req.params.showingid + "'", function (err, rows) {
        if (err) throw err

        res.json(rows.rows[0]);
        connection.end();
    });

}


const seatstaken = function (req, res) {
    const connection = newClient();
    //console.log(JSON.stringify(req.params.showingid));
    connection.query("select seat from tickets where showing='" + req.params.showingid + "'", function (err, rows) {
        if (err) throw err
        const arr = [];
        for (const i in rows.rows) {
            arr.push(rows.rows[i].seat);
        }
        res.json(arr);
        connection.end();
    });

}





const sendEmail = (tickets) => {
    console.log(tickets);
    htmlTemplate = `
    <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" type="text/css" href="email.css">
    </head>
    <body>
    <div>
    <h2>Hello!</h2>
    <h3>You have successfully ordered tickets for the show:</h3>
        <div id="ticket">
        <p>${tickets.showingDesc.title} Date:${tickets.showingDesc.fullDate} ${tickets.showingDesc.date}</p>
        <p style="font-weight:bold;">Seats: ${tickets.seats}</p>
        <hr><p>Tickets are attached in the email!</p>
        <div>
        <p style="color:red;font-weight:normal;">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod 
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
        sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </div> <hr>   
    <div id="footer" style="display:block">
    <p style="color:green;margin:0 auto;">FOOTER CINEMA'S DATA</p>
    <p style="margin:0 auto;">LOGO</p>
    </div> 
    </body>
  </html>`;

    /*  const mailOptions = {
          from: 'cinemanode@gmail.com',
          to: tickets.email,
          subject: 'Tickets Cinemanode',
          html: htmlTemplate
      };*/


    const mailOptions = {
        from: 'cinemanode.api@gmail.com',
        to: tickets.email,
        subject: 'Tickets Cinemanode',
        html: htmlTemplate
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}



const newticket = function (req, res) {
    sendEmail(req.body);
    const showingDesc = req.body.showingDesc;
    delete req.body.showingDesc;
    const vals = Object.keys(req.body).map(function (key) { // DO I NEED IT??
        return req.body[key];
    });
    //console.log(vals);
    const results = [];
    vals.splice(1, 1);
    console.log(vals);
    vals.forEach(function (params) {
        if (params === undefined || params === '' || params === null) {
            res.json({ success: false, msg: "Missing parameters" });
        }
    });
    const seats = req.body.seats;
    //console.log(vals.showingDesc);
    async.forEachOf(seats, function (seat) {
        const connection = newClient();
        //2018-05-02T09:28:00.000Z
        connection.query("INSERT INTO tickets(showing,seat,price,email,status,purchasedate) VALUES($1," + seat + ",$2,$3,'1','" + moment().format() + "')", vals, function (err, result) {
            // if (err) res.json({ success: false, msg: err });
            if (err) throw err;
            connection.end();
        });


    });






    /* PDF creating test
        const doc = new PDFDocument()
       // let filename = req.body.filename
       let filename="test";
        // Stripping special characters
        filename = encodeURIComponent(filename) + '.pdf'
        // Setting response to 'attachment' (download).
        // If you use 'inline' here it will automatically open the PDF
      //  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
      //  res.setHeader('Content-type', 'application/pdf')
    
    
        const content = "Test content";
        doc.y = 300
        doc.text(content, 50, 50)
        doc.pipe(fs.createWriteStream('/tmp/output.pdf'));
       // doc.pipe(res)
        doc.end() */


    res.json({ success: true, msg: "Tickets created!" });

    // connection.end();
    // next();
}




const newshowing = function (req, res) {
    const params = req.body;
    const values = Object.keys(req.body).map(function (key) {
        return req.body[key];
    });


    /*vals.forEach(function(params) {
        if (params === undefined || params === '') {
            res.json({ success: false, msg: "Missing parameters" });
        }
    });*/

    const connection = newClient();
    //2018-08-03T09:28:00.000Z
    connection.query("INSERT INTO showings(film,price,room,date) VALUES($1,$2,$3,$4)", values, function (err, result) {
        // if (err) res.json({ success: false, msg: err });
        //console.log(result, err);
        // console.log(result, err);
        if (err) throw err;
        connection.end();

    });


    //  console.log(values);
    res.json({ success: true, msg: values });

}



const newfilm = function (req, res) {
    const params = req.body;
    const values = Object.keys(req.body).map(function (key) {
        return req.body[key];
    });


    const connection = newClient();
    //2018-08-03T09:28:00.000Z
    connection.query("INSERT INTO films(title,director,genre,length,category,imageurl) VALUES($1,$2,$3,$4,$5,$6)", values, function (err, result) {
        // if (err) res.json({ success: false, msg: err });
        //console.log(result, err);
        //console.log(result, err);
        if (err) throw err;
        connection.end();

    });


    // console.log(values);
    res.json({ success: true, msg: values });

}


const newprice = function (req, res) {
    const params = req.body;
    const values = Object.keys(req.body).map(function (key) {
        return req.body[key];
    });


    const connection = newClient();
    //2018-08-03T09:28:00.000Z
    connection.query("INSERT INTO prices(normal,discount) VALUES($1,$2)", values, function (err, result) {
        // if (err) res.json({ success: false, msg: err });
        if (err) throw err;
        connection.end();

    });


    // console.log(values);
    res.json({ success: true, msg: values });

}


const deleteshowingfunc = function (showid) {
    const connection = newClient();
    connection.query("DELETE FROM SHOWINGS WHERE ID=" + showid).then(res2 => {
        //  console.log(res2,showid);
        connection.end();
    }).catch(e => console.error(e.stack));
}

const deleteshowing = function (req, res) {
    const params = req.body;
    deleteshowingfunc(params.showid);
    res.json({ succes: true, msg: params.showid });
}



const deletefilm = function (req, res) { // delete tickets(showing(film))
    const params = req.body;
    const connection = newClient();

    connection.query("DELETE FROM FILMS WHERE ID=" + params.filmid, function (err, result) {
        if (err) throw err;
        connection.end();

    });

    res.json({ succes: true, msg: "hehe" });



}

const editfilm = function (req, res) {
    const params = req.body;
    const values = Object.keys(params).map(function (key) {
        return params[key];
    });

    values.shift();
    console.log(values);
    const connection = newClient();

    connection.query("UPDATE films SET title=($1),director=($2),genre=($3),length=($4),category=($5) WHERE id=" + params.id, values, function (err, result) {
        if (err) throw err;
        connection.end();

    });

    res.json({ succes: true, msg: params });
}


const editcustomer = function (req, res) {
    const params = req.body;
    const values = Object.keys(params).map(function (key) {
        return params[key];
    });

    values.shift();
    console.log(values);
    const connection = newClient();

    connection.query("UPDATE customers SET email=($1),name=($2),surename=($3),telephone=($4) WHERE id=" + params.id, values, function (err, result) {
        if (err) throw err;
        connection.end();

    });

    res.json({ succes: true, msg: params });
}


const deleteprice = function (req, res) { //delete tickets(showing(price))
    const params = req.body;
    const connection = newClient();
    connection.query("DELETE FROM PRICES WHERE ID=" + params.priceid, function (err, result) {

    });

    res.json({ succes: true, msg: params });
}


const deleteticket = function (req, res) { //delete tickets(showing(price))
    const params = req.body;
    const connection = newClient();
    connection.query("DELETE FROM TICKETS WHERE ID=" + params.ticketid, function (err, result) {

    });

    res.json({ succes: true, msg: params });
}

//select t.id ,s.title, t.seat,t.price,t.email,t.status,t.purchasedate FROM tickets t, showings s WHERE t.showing=s.id"
const ticketsquery = function (req, res) {
    const connection = newClient();
    connection.query('select t.id, f.title, t.seat, t.price, t.email, t.status, t.purchasedate FROM tickets t, films f, showings s WHERE s.id=t.showing AND f.id=s.film', function (err, rows) {
        if (err) res.json(err);
        //console.log(rows);
        res.json(rows.rows);
        connection.end();
    });
}


const ticketsbycustomer = function (req, res) {
    const params = req.body;
    //console.log(params.customerid);
    const connection = newClient();
    connection.query("select * from tickets  t, showings s, films f WHERE t.showing=s.id AND s.film=f.id AND email IN (SELECT email FROM customers WHERE id=" + params.customerid + ")", function (err, rows) {
        if (err) res.json(err);
        //  console.log('ticketscustomer', rows.length);
        res.json(rows.rows);
        connection.end();
    });
}



const showingsquery = function (req, res) {
    const connection = newClient();
    connection.query("select * from showings", function (err, rows) {
        if (err) res.json(err);
        res.json(rows.rows);
        connection.end();
    });
}


const roomsquery = function (req, res) {
    const connection = newClient();
    connection.query("select * from rooms", function (err, rows) {
        if (err) res.json(err);
        res.json(rows.rows);
        connection.end();
    });
}


const pricesquery = function (req, res) {
    const connection = newClient();
    connection.query("select * from prices", function (err, rows) {
        if (err) res.json(err);
        res.json(rows.rows);
        connection.end();
    });
}


const filmsquery = function (req, res) {
    const connection = newClient();
    connection.query("select * from films", function (err, rows) {
        if (err) res.json(err);
        res.json(rows.rows);
        connection.end();
    });
}



const sendtickets = function (req, res) {

    const params = req.body;
    console.log(params.tickets);
    /*
        const mailOptions = {
            from: 'cinemanode@gmail.com',
            to: 'benuch91@gmail.com',
            subject: 'Tickets Cinemanode',
            html: params.tickets
        };*/


    const mailOptions = {
        from: 'charlotte.kihn6@ethereal.email',
        to: 'benuch91@gmail.com',
        subject: 'Tickets Cinemanode',
        html: params.tickets
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.json({ "msg": params })
}


module.exports = { showings, mysql, showingsbydate, seatsshowing, seatstaken, newticket, ticketsquery, filmsquery, pricesquery, roomsquery, showingsquery, test, newshowing, newfilm, newprice, deleteshowing, deletefilm, deleteprice, deleteticket, ticketsbycustomer, editfilm, editcustomer, sendtickets };