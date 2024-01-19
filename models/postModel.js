const mongoose = require('mongoose');

const {Schema,SchemaTypes} = mongoose;

const {String,Mixed,ObjectId,} = SchemaTypes

const postSchema = new Schema({
    postContent : String ,
    postPicture : String,
    postCreator : ObjectId
}
,
{
    timestamps:true
}
)

const post = mongoose.model('TweetXPost',  postSchema);
module.exports = post;