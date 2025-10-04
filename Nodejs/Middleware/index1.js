const express = require('express');
const app = express();

let request_count = 0;  

function Middleware(req,res,next){
    console.log("Method is"+ req.method);
    console.log("URL is"+ req.hostname);
    console.log("route is"+ req.url);
    console.log("Date and time is"+ new Date());
    next();
}
 
app.use(Middleware);

app.get('/multiply', function(req,res) {
 let a= parseInt(req.query.a);
 let b= parseInt(req.query.b);
if (isNaN(a)||isNaN(b)){
    return res.status(400).json({error:"provide a number"});
}
    let result=a*b;
    res.json({
        a:a,
        b:b,
        result:result
    });
});

app.get('/divide', function(req,res) {
    request_count++;    
    console.log("Total number of requests=" + request_count)
    // /main logic
 let a= parseInt(req.query.a);
 let b= parseInt(req.query.b);

if (isNaN(a)||isNaN(b)){
    return res.status(400).json({error:"provide a number"});
}
    let result=a/b;
    res.json({
        a:a,
        b:b,
        result:result
    });
});

app.get('/add', function(req,res) {
 let a= parseInt(req.query.a);
 let b= parseInt(req.query.b);

if (isNaN(a)||isNaN(b)){
    return res.status(400).json({error:"provide a number"});
}
    let result=a+b;
    res.json({
        a:a,
        b:b,
        result:result
    });
});


app.get('/sub', function(req,res) {
 let a= parseInt(req.query.a);
 let b= parseInt(req.query.b);

if (isNaN(a)||isNaN(b)){
    return res.status(400).json({error:"provide a number"});
}
    let result=a-b;
    res.json({
        a:a,
        b:b,
        result:result
    });
});


app.listen(3000);
