const mongoose = require('mongoose');

const {Schema,SchemaTypes} = mongoose;

const {String,ObjectId} = SchemaTypes

const postSchema = new Schema({
    postContent : String ,
    postPicture : String,
    postCreator : {
        userName:{type:String, required:true},
        profilePicture:String,
        id:ObjectId
    }
}
,
{
    timestamps:true
}
)

const post = mongoose.model('TweetXPost',  postSchema);
module.exports = post;