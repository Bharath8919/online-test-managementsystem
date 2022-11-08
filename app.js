var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var bcrypt = require("bcryptjs");
var path = require("path");
const mongoose = require("mongoose");
const User = require('../END-REVIEW-34 2/models/user');
const { getMaxListeners } = require("process");

mongoose.connect('mongodb://localhost:27017/SBU');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback) {
        console.log("connection succeeded");
    })
    //mongoose.connect('mongodb://localhost:27017/FFSD-1').then(() => {
    //console.log("Database Connected");
    //}).catch((err) => {
    //console.log("Error" + err.message);
    //});
var signup_details = db.collection('signup_details');
var contact = db.collection('contactus');
var app = express();
var cur_email, cur_pass, cur_user;
app.use(bodyParser.json());

/* app.use(express.static('HTML'));
app.use(express.static('IMAGES'));
app.use(express.static('CSS')); */

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/Views"));

app.get('/', function(req, res) {
    res.render('Home');
});
app.get('/Login', function(req, res) {
    res.render('Login');
});
app.get('/home_1', function(req, res) {
    res.render('home_1');
});
app.get('/Contactus', function(req, res) {
    res.render('Contactus');
});
app.get('/AddUser', function(req, res) {
    res.render('AddUser');
});
app.get('/reply', function(req,res) {
    res.render('message_reply');
});
app.get('/admin', function(req, res) {
    res.render('Admin');
});

// For Signup
app.post('/signup', function(req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    var pass1 = req.body.password1;
    var username = req.body.username;
    var dob = req.body.dob;
    var profession = req.body.profession;
    var info = req.body.info;

    var data = {
        "email": email,
        "password": pass,
        "password1": pass1,
        "username": username,
        "dob": dob,
        "profession": profession,
        "info": info
    }
    db.collection('signup_details').insertOne(data, function(err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
    });
    cur_email = email;
    cur_pass = pass;
    return res.redirect('home_1');

})

// for contact us form
app.post('/contactus', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var ph_num = req.body.phone;
    var mssg = req.body.message;

    var data = {
        "name": name,
        "email": email,
        "phone": ph_num,
        "message": mssg
    }
    db.collection('contactus').insertOne(data, function(err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
    });
    return res.redirect('/HTML/Success.html');

})

// For Login

app.post('/login', function(req, res) {
    const email = req.body.email;
    const pass = req.body.password;

    if (email === "admin@gmail.com" && pass === "admin123") {
        res.render('Admin');
        return;
    }
    const data = {
        "email": email,
        "password": pass
    }

    db.collection('signup_details').findOne(data, function(err, user) {
        if (user) {
            cur_email = email;
            cur_pass = pass;
            console.log("login successful")
            res.redirect('home_1');
        } else {
            console.log("Incorrect details");
            res.redirect('Login');
        }
    })
})

// After editing user details by user

app.get('/dir_profile', function(req, res) {
    signup_details.findOne({ "email": cur_email }, function(err, details) {
        if (err) throw err;
        res.render("UserProfile", { data: details });
    })
})


// updating the details of a user by user

app.post('/userdetails', function(req, res) {
        const name = req.body.username;
        const email = req.body.email;
        const dob = req.body.dob;
        const profession = req.body.profession;
        const info = req.body.info;

        const original = {
            "email": cur_email
        }

        const data = {
            $set: {
                "username": name,
                "email":email,
                "dob": dob,
                "profession": profession,
                "info": info
            }
        }
        signup_details.updateOne(original, data, function(err, exist) {
            if (err) throw err;
            console.log("Record updated successfully");
        })

        res.render('home_1')

    })


    // For UserDetails
/* app.post('/userdetails', function(req, res) {
    var Username = req.body.username;
    var email = req.body.email;
    var DOB = req.body.dob;
    var prof = req.body.profession;
    var info = req.body.info;



    var data = {
        "username": Username,
        "email": email,
        "DOB": DOB,
        "profession": prof,
        "Additional Info": info
    }
    db.collection('users').insertOne(data, function(err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
    });
    return res.redirect('/HTML/Success.html');

}) */

// display all users of our website in admin page

app.get('/user_display', function(req, res) {
    signup_details.find({}).toArray(function(err, result) {
        if (err) throw err;
        res.render("userdisplay", { content: result });
    })
})


// display all contact us form details in admin page

app.get('/message_display', function(req, res) {
    contact.find({}).toArray(function(err, result) {
        if (err) throw err;
        res.render("messagesdisplay", { data: result });
    })
});


// delete users by admin

app.post('/del',function(req,res){
    const del = req.body.delete;
    console.log(del);
    const myquery = { "email": del };
    signup_details.deleteOne(myquery, function(err, obj) {
       if (err) throw err;
       res.redirect('/user_display');
   });
   
})


// delete messages by admin

app.post('/delmsg',function(req,res){
    const del = req.body.delete;
    console.log(del);
    const myquery = { "email": del };
    contact.deleteOne(myquery, function(err, obj) {
       if (err) throw err;
       res.redirect('/message_display');
   });
   
})


// Add a user by admin

app.post('/addusers', function(req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    var pass1 = req.body.password1;
    var username = req.body.username;
    var dob = req.body.dob;
    var profession = req.body.profession;
    var info = req.body.info;

    var data = {
        "email": email,
        "password": pass,
        "password1": pass1,
        "username": username,
        "dob": dob,
        "profession": profession,
        "info": info
    }
    db.collection('signup_details').insertOne(data, function(err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
    });/* 
    cur_email = email;
    cur_pass = pass; */
    return res.redirect('/user_display');

})


/*
app.get("/deletemessage/:id", async(req, res) => {

    contact.deleteOne({ _id: req.params.id }).then(() => {
        res.send("<script>alert('Deleted'); window.location.href='/messagesdisplay'</script>")
    }).catch((error) => { console.log("Error") });
});
app.delete('/userdisplay/:id', async(req, res) => {
    const { id } = req.params;
    const deleteuser = await User.findByIdAndDelete(id);
    res.redirect('userdisplay');
})*/


app.get('/', function(req, res) {
    res.set({
        'Access-control-Allow-Origin': '*'
    });
    return res.redirect('Home');
}).listen(3000)

console.log("server listening at port 3000");