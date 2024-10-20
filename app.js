const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const postModel = require("./models/post");
const feedbackModel = require("./models/enquiry");
const upload = require("./config/multerConfig");

app.set("view engine","ejs");

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

app.use(cookieParser());

app.get("/profile/upload",isLoggedIn,(req,res) => {
    res.render("uploadPic");
});

app.post("/upload",isLoggedIn,upload.single("image"),async (req,res) => {
    let user = await userModel.findOne({email: req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
})

app.get("/",(req,res) => {
    res.render("main");
});

app.post("/feedback",async (req,res) => {
    let {name, email, message} = req.body;
    let userFeed = await feedbackModel.create({
        name: name,
        email: email,
        message: message
    });

    res.redirect("/");
});


app.get("/signUp",(req,res) => {
    res.render("index");
});

app.post("/create",async (req,res) => {
    let {username, name, email, password, age} = req.body;
    let user = await userModel.findOne({email: email});
    if(user) return res.status(500).send("user is already exist");

    bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(password,salt,async (err,hash) => {
            let createdUser = await userModel.create({
                username: username,
                name: name,
                email: email,
                password: hash,
                age: age
            });
            
            let token = jwt.sign({email: email, userId: createdUser._id},"secret");
            res.cookie("token",token);
            res.redirect("/login");
        });
    });
});


app.get("/logout",(req,res) => {
    res.cookie("token","");
    res.redirect("/login");
});

app.get("/login",(req,res) => {
    res.render("login");
});

app.post("/login",async (req,res) => {
    let {email, password} = req.body;
    let user = await userModel.findOne({email: email});
    if(!user) return res.redirect("/login");

    bcrypt.compare(password,user.password,(err,result) => {
        if(result){
            let token = jwt.sign({email: email, userid: user._id},"secret");
            res.cookie("token",token);
            res.redirect("/profile");
        }else{
            res.redirect("/login");
        }
    });
});

app.get("/profile",isLoggedIn,async (req,res) => {
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    res.render("profile",{user});
});

app.post("/post",isLoggedIn,async (req,res) => {
    let {content} = req.body;
    let user = await userModel.findOne({email: req.user.email});

    let post = await postModel.create({
        post: user._id,
        content: content
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
});

app.get("/like/:id",isLoggedIn,async (req,res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("post");

    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }

    await post.save();
    res.redirect("/profile");
});

app.get("/edit/:id",isLoggedIn,async (req,res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("post");

    res.render("edit",{post});
});

app.post("/Update/:id",isLoggedIn,async (req,res) => {
    let {content} = req.body;
    let post = await postModel.findOneAndUpdate({_id: req.params.id},{content});
    res.redirect("/profile");
});

app.get("/delete/:id",isLoggedIn,async (req,res) => {
    let post = await postModel.findOneAndDelete({_id: req.params.id});
    res.redirect("/profile");
});


app.get("/payment",(req,res) => {
    res.render("payment");
});


//work

app.get("/help",(req,res) => {
    res.render("chat");
})

app.get("/help/workout",(req,res) => {
    res.render("workout");
})

app.get("/help/back",(req,res) => {
    res.render("back");
})

app.get("/help/chest",(req,res) => {
    res.render("chest");
})

app.get("/help/biceps",(req,res) => {
    res.render("biceps");
})

app.get("/help/shoulder",(req,res) => {
    res.render("shoulder");
})

app.get("/help/leg",(req,res) => {
    res.render("leg");
})




function isLoggedIn(req,res,next){
    if(req.cookies.token === ""){
        res.redirect("/login");
    }else{
        let data = jwt.verify(req.cookies.token,"secret");
        req.user = data;
        next();
    }
}


app.listen(3000);
