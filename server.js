const express = require("express");
const session = require('express-session')

const app = express();

app.use(session({
    secret: 'key that will sign cookie',
    resave: false,
    saveUninitialized: false
}));

app.get("/",(req,res)=>{
    console.log(req.session);
    res.send("Hello");
});

app.listen(5000,console.log("Server Running on http://localhost:5000"));