const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 3001;
const uri = process.env.TWEET_X_CLUSTER_URI;

//Connecting to server
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.listen(port, () => {
    console.log(`server listening on ${port}`); 
});

//connecting to database
mongoose.connect(uri);

const connection  = mongoose.connection;
connection.once('open', () => {console.log("MongoDB database connection established successfully")});

//Home
app.get('/', (req, res) => {
    res.send('hello world')
})

// imports 
const userRouter = require('./routers/user')
const postRouter = require('./routers/post')
const feedRouter = require('./routers/feed')

// routers
app.use('/user',userRouter)
app.use('/post',postRouter)
app.use('/feed',feedRouter)



