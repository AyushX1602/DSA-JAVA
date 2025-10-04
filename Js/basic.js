// function greet(user){
// console.log("hello "+user.gender+user.name+" your age is "+user.age)
// }
// let user = {
//     name: "John",
//     gender: "other",
//     age: 3
// }
// greet(user)


// if (user.age > 18) {
//     console.log("You can vote");
// }
// else {
//     console.log("You cannot vote");
// }


// function check(arr){
//  for(let user of arr){
//  if(user.age>18 && user.gender==="male"){
//     console.log(user.name+" can vote "+user.age+" "+user.gender)
//  }
// }
// }
// const users=[{
//         name: "John",
//         gender: "other",
//         age: 3
// },{
//         name: "Jane",
//         gender: "female",
//         age: 25
//     },{
//         name: "Doe",
//         gender: "male",
//         age: 40
//     }
// ]
// check(users)




// const users = [
//     { name: "John", gender: "other", age: 3 },
//     { name: "Jane", gender: "female", age: 25 },
//     { name: "Doe", gender: "male", age: 40 }
// ];

// const eligibleUsers = users.filter(user => user.age > 18 && user.gender === "male");
// eligibleUsers.forEach(user => {
//     console.log(eligibleUsers);
// });


// function sum (a,b){
//     return a+b;
// }
// let ans= sum(2,3);
// console.log(ans);


// function sum (n){
//     let total = 0;
//     for(let i=0;i<=n;i++){
//         total += i;
//     }
//     return total;
// }
// console.log(sum(5));

// Synchronus 
// const fs= require('fs');
// const data= fs.readFileSync('a.txt','utf-8') 
// console.log(data);
// const data1= fs.readFileSync('b.txt','utf-8');
// console.log(data1);

// asnchronously 
// const fs= require("fs");
//  function print(err,data){
//     console.log(data);
//  }
//  fs.readFile("a.txt","utf-8",print)
//  fs.readFile("b.txt","utf-8",print)
//  console.log("done");


//class
// class Rectangle{
//             constructor(width,height,color){
//                 this.width=width;
//                 this.height=height;
//                 this.color=color;
//             }

// area(){
//     const area=this.width*this.height;
//     return area;
// }

// print(){
//     console.log(`Painting with color ${this.color}`)
//     }
// }
// const rect= new Rectangle(10,10,"red")    
// const area =rect.area();
// const print= rect.print();

// console.log(area);


// const map =new Map();
// map.set('name','abc');
// map.set('age',10);

// console.log(map.get('name'));

// function callback(){
//     console.log("some time has passed!");
// }
// setTimeout(callback,3000);


//Promises

// function waitfor3s(callback){
//     setTimeout(callback,3000)
//     console.log("main is called");
// }
// function main(){
//     console.log("main is called");
// }
// function calling(main){
//     console.log("main is called");
// }
// waitfor3s(main);
// calling(waitfor3s);
// waitfor3s(calling);


// function setTimeoutPromosified (ms) {
//     return new Promise(resolve=>setTimeout(resolve,ms));
// }
// function callback(){
//     console.log("3 secounds have passed ");
//     }
     
// setTimeoutPromosified(3000).then(callback);


// function random (resolve){
//     setTimeout(resolve,3000);
// }
// let p=new Promise(random);
// console.log(p);

// function callback(){
//     console.log("promise succeded!");   
// }
// p.then(callback);



// const fs=require('fs');
// function readtheFile(SendTheFinalValueHere){

// const data= fs.readFile('a.txt','utf-8',function(err,data){
//     SendTheFinalValueHere(data);
//     })
// }
// function readFile(fileName){
//     return new Promise (readtheFile);
// }
// const p= readFile();

// function callback(contents){
//     console.log(contents);
// }
// p.then(callback);

////callback hell
// function callback(){
//     console.log("Hi");
// }

// setTimeout(function(){
//         console.log("Hello");
//     setTimeout(function(){
//             console.log("Hi");
//         },3000);
// },1000);



// function setTimeoutPromisified(ms){
//     return new Promise(resolve => setTimeout(resolve,ms));
// }

// setTimeoutPromisified(3000)
// .then(function(){
//     console.log("Hello");
//     return setTimeoutPromisified(1000);
// })
// .then(function(){
//     console.log("Hi");
//     return setTimeoutPromisified(2000);
// })
// .then(function(){
//     console.log("Hello again");
// })



// async await

function setTimeoutPromisified(duration){
    return new Promise(function(resolve ){
        setTimeout(resolve,duration);
    });
}

async function solve(){
    await setTimeoutPromisified(1000);
    console.log("Hi");
    await setTimeoutPromisified(2000);
    console.log("Hello");
    await setTimeoutPromisified(3000)
    console.log("hello again");
}
solve();
 console.log("yo")