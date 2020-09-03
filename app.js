const express = require("express");
const app = express();
const keys = require("./config/keys");
const path = require("path");
const http = require("http").createServer(app);
let io = require("socket.io")(http);
const bodyParser = require("body-parser");
const cors = require("cors");
const flash=require("connect-flash");
const session=require("express-session");
const mongooseStore=require("connect-mongodb-session")(session);


// DB Config
require("./config/db");


//sesion store
store=new mongooseStore({
    uri:keys.mongoURI,
    collection:"sessions"
});


// Session
app.use(session({
    secret:keys.secret,
    saveUninitialized:false,
    resave:false,
    store:store
}))

// routes
const poll = require("./routes/poll");

// view engine
app.set("view engine",'ejs')

// Set public folder
app.use(express.static(path.join(__dirname, "public")));


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// exporting io
app.use('/',(req,res,next)=>{
    req.io=io
    next()
})

//Flash middleware
app.use(flash());
app.use((req,res,next)=>
{
     res.locals.flash_error=req.flash("flash_error");
     next();
})
app.use("/poll", poll);



const port = 3000;

// Start server
http.listen(port, () => console.log(`Server started on port ${port}`));
