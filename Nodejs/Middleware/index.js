const express = require('express');

const app = express();

//function that returns a boolean if the age of the person is more than 14 or not

// function oldenough(age){
//     if (age>14){
//         return true;
//     }
//     else{
//         return false;
//     }   
// }

function olEnoughMiddleware(req,res,next){
    const age = req.query.age;
    if(age>=14){
        next();
    } else {
        res.json({
            msg:"you are not old enough to ride this ride"
        });
    }
}
// app.get("/ride1",olEnoughMiddleware,function(req,res){
//     if (oldenough(req.query.age)){
// res.json({
//     msg:"you have ridden my ride to heaven"
//     })
// } else {
//     res.status(409).json({
//         msg:"you are not old enough to ride this ride"
//     })
// }

// })

app.get("/ride1",olEnoughMiddleware,function(req,res){
    res.json({
        msg:"you have ridden my ride to heaven"
    });
});

app.get("/ride2",olEnoughMiddleware,function(req,res){
    res.json({
        msg:"you have ridden my ride to hell"
    });
});

app.listen(3000);