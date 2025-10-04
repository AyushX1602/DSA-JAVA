const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "random111"
const { UserModel, TodoModel } = require('./db');
const { z } = require('zod');


// Middleware to parse JSON
app.use(express.json());

app.post('/signup' , async function(req,res){

    const requiredBody = z.object({
        email : z.string(),
        name : z.string(),
        password : z.string()
    })

    const parsedDataWitString = requiredBody.safeParse(req.body);

    if (!parsedDataWitString.success){
        res.status(400).json({
            message : "Invalid request body"
        })
        return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hashedPassword = await bcrypt.hash(password, 5);
    console.log(hashedPassword);

   await  UserModel.create({
        email : email,
        password : hashedPassword,
        name : name
    })
    res.json({
        message : "You are signed up "
    })

})


app.post('/login' ,async  function(req,res){

    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email : email,
    })
    if(!user){
        res.status(403).json({
            message : "Invalid credentials"
        })
        return;
    }

   const passwordMatch = await bcrypt.compare(password,user.password);

    if (passwordMatch){
        const token = jwt.sign({
            id : user._id.toString(),
        }, JWT_SECRET);
        res.json({
            message : "You are logged in ",
            token : token
        })
    }
    else {
        res.json({
            message : "Invalid credentials"
        })
    }
})



app.post('/todo',auth , function(req,res){

    const userId = req.userId;

    res.json({
        userId : userId
})
});


app.get('/todos',auth , function(req,res){

    const userId = req.userId;

    res.json({
        userId : userId
    })
})


function auth(req, res, next) {
    const token = req.headers.token;

    const decodedData = jwt.verify(token, JWT_SECRET);

    if (decodedData){
        req.userId = decodedData.id;
        next();
    }
    else
{
        res.json({
            message : "Invalid token"
        })
    }
}



app.listen(3000)