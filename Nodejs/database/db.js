const mongoose = require('mongoose');
const ObjectId =mongoose.ObjectId; 
const Schema = mongoose.Schema;

mongoose.connect("mongodb+srv://ayushpathak16022005_db_user:sdkaLqtfFbZ7Qs0p@cluster0.nzijvyg.mongodb.net/Todos")

const user = new Schema({
   email: {type :String , unique : true},
   password : String,
   name : String  
})

const Todo = new Schema({
    title: String,
    done : Boolean,
    userId : ObjectId
})


const UserModel = mongoose.model('users', user);
const TodoModel = mongoose.model('todos', Todo);


module.exports = {
    UserModel: UserModel,
    TodoModel : TodoModel
} 