const express = require('express');
const jwt= require('jsonwebtoken');
const path = require('path');
const JWT_Secret="Hutejkichut"
const app = express();
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, token');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const users =[];

// Serve the main HTML file at root
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

app.post('/signup', function(req,res){

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

app.post('/signin', function(req,res){

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


app.get('/me.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'me.html'));
});


app.get("/me", function(req, res){

    const token = req.headers.token;
    
    // Check if token is provided
    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try {
        const decodeInformation = jwt.verify(token, JWT_Secret);

        // Fix: Use 'decodeInformation' not 'decodedInformation'
        if(decodeInformation.username){
            let founduser = null;

            for(let i = 0; i < users.length; i++){
                // Fix: Compare with decodeInformation.username
                if(users[i].username == decodeInformation.username){
                    founduser = users[i];
                    break;
                }
            }

            if(founduser) {
                res.json({
                    username: founduser.username,
                    password: founduser.password
                });
            } else {
                res.status(404).json({
                    message: "User not found"
                });
            }
        } else {
            res.status(401).json({
                message: "Invalid token"
            });
        }
    } catch (error) {
        res.status(403).json({
            message: "Invalid or expired token"
        });
    }
});

    app.listen(3000, () => {
    console.log('Auth server running on port 3000');
    console.log('Open http://localhost:3000 in your browser');
});