const express = require("express");
const bcrypt = require("bcryptjs");
const session = require('express-session');
const MonoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const app = express();

const UserModel = require("./models/User");
const mongoURI = 'mongodb+srv://NodedjsSessionsandCookies:sOVfiYMhRDKyH0Mh@nodedjssessionsandcooki.mk2edab.mongodb.net/'

// connect to mongodb
mongoose.connect(mongoURI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => console.log("DB error", err));

// Create a new instance of connect-mongodb-session to store sessions in MongoDB
const store = new MonoDBSession({
    uri:mongoURI, // MongoDB URI for session store
    collection: 'mySessions' // Name of the collection to store sessions
});

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: 'key that will sign cookie',
    resave: false,
    saveUninitialized: false,
    store: store
}));

const isAuth = (req,res,next) =>{
    if(req.session.isAuth){
        next();
    }
    else{
        res.redirect('/login');
    }
}

app.get("/",(req,res)=>{
    res.render("landing");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login", async(req,res)=>{
    const {email, password} = req.body;

    let user = await UserModel.findOne({email});

    if(!user){
        return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.redirect('/login');
    }

    req.session.isAuth = true;

    res.redirect('/dashboard');

});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",async (req,res)=>{
    const {username, email, password} = req.body;
    let user = await UserModel.findOne({email});

    if(user){
        return res.redirect('/register');
    }

    const hashedPsw = await bcrypt.hash(password,12);

    user = new UserModel({
        username,
        email,
        password:hashedPsw
    })

    await user.save();

    res.redirect("/login");
});

app.get("/dashboard",isAuth,(req,res)=>{
    res.render("dashboard");
});

app.post("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect('/');
    })
})

app.listen(5000,console.log("Server Running on http://localhost:5000"));