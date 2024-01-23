const mongoose = require('mongoose');

const {Schema,SchemaTypes} = mongoose;

const {String,ObjectId} = SchemaTypes

const userSchema = new Schema({
    userName:{type:String, required:true},
    password:{type:String, required:true},
    email:{type:String , required:true},
    profilePicture:String,
    posts:[{type:ObjectId}],
    followers:[{type:ObjectId}],
    following:[{type:ObjectId}]
}
,
{
    timestamps:true
}
)

const user = mongoose.model('TweetXUser',  userSchema);
module.exports = user;