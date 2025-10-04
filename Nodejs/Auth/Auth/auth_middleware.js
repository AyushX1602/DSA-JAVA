const express = require('express');
const jwt= require('jsonwebtoken');
const JWT_Secret="Hutejkichut"
const app = express();
app.use(express.json());

const users =[];

// function generate_token(){
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let token = '';
//     const tokenLength = 32;
    
//     for (let i = 0; i < tokenLength; i++) {
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         token += characters[randomIndex];
//     }
    
//     return token;
// }

function logger(req,res,next){
    console.log(req.method+"request came");
    next();
}


app.get('/',function(req,res){
    res.sendFile(__dirname + "/public/index.html")
})

app.post('/signup',logger, function(req,res){

    const username =req.body.username;
    const password =req.body.password;

     if(users.find(u=>u.username===username)){
        res.json({
            message: "user alredy exist"
        })
    return
    }

    users.push({
        username: username,
        password : password
    })

    res.json({
        message:"user created"
    })
console.log(users);
}
);

app.post('/signin',logger, function(req,res){

        const username =req.body.username;
        const password =req.body.password;

        let founduser=null;

        for(let i=0;i<users.length;i++){
            if(users[i].username==username && users[i].password==password){
                founduser=users[i];
                break;
            }
        }
        if (founduser) {
            const token = jwt.sign({
                username
            },JWT_Secret);
            founduser.token=token;
            res.json({
                token:token
            })
        }else{
            res.status(403).send({
                message:"user not found"
            })
        }

        console.log(users);
});

function auth(req,res,next){
    const token = req.headers.token;
    
    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        });
    }
    
    try {
        const decodeInformation = jwt.verify(token, JWT_Secret);
        if(decodeInformation.username){
            req.username = decodeInformation.username;
            next();
        } else {
            res.status(401).json({
                message: "Invalid token"
            });
        }
    } catch (error) {
        res.status(403).json({
            message: "You are not logged in"
        });
    }
}

app.get("/me",auth,logger,function(req,res){

    
        let founduser = null;

        for(let i=0;i<users.length;i++){
            if(users[i].username===req.username){
                founduser=users[i]
            }
        }
    
        res.json({
            username: founduser.username,
            password: founduser.password
        })
    })

app.listen(3000);