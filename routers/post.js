const router = require('express').Router();
const user = require('../models/userModel');
const post = require('../models/postModel');
const { jwtDecode } = require("jwt-decode");
const {uploadToCloudinary,deleteFromCloudinary} = require('../controllers/cloudinary')
const upload = require('../middleware/multer')

// retrieve all posts of a user
router.route('/').get(async (req, res) => {
  
    const { authorization } = req?.headers
    // const { data } = jwtDecode(authorization)
    console.log(authorization)
    if (authorization?.length >= 200) {

        const { data } = jwtDecode(authorization)
  
        const { id, userName, email } = data;
        console.log(id, userName, email)
        const query ={
            "postCreator.id":{$eq : id} 
        };

        post.find(query)
            .then(response => {
                console.log(response)
                res.status(200).json({ posts: response})
            })
            .catch(error => {
                console.error(error)
                res.status(404).json({ error: error })
            })

    }
    else {
        res.status(401).json({ code: 'UNAUTHORISED REQUEST' })
    }
})

// add a post and update its corresponding user
router.route('/').post(upload.single('postPicture'), async (req, res) => {

    const { authorization } = req?.headers

    const Imagefile = {
        fileName:req?.file?.filename,
        file:req?.file?.buffer
    }
   
    if (authorization?.length >= 200) {

        const { postContent } = req?.body
        const { data } = jwtDecode(authorization)
        const { id } = data;
        console.log(id)
        try {
            const User = await user.findById(id);

            if (User) {
                // image upload result
                const file = Imagefile?.file
                const result = file && await uploadToCloudinary(file);
                const secure_url = await result?.secure_url ;

                const newPost =  new post({
                    postContent: postContent,
                    postPicture: secure_url,
                    postCreator:{
                        userName:User?.userName,
                        profilePicture:User?.profilePicture,
                        id:id
                    } 
                })

                try {
                    const postResponse = await newPost.save();
                    const { _id } = postResponse
                    console.log(postResponse)

                    const update = {
                        $push: {
                            posts: _id,
                        },
                    };

                    const options = {
                        new: true, // Return the modified document rather than the original
                    };

                    user?.findByIdAndUpdate(id, update, options)
                        .then(response => {
                            console.log(response)
                            res.status(200).json({ post: postResponse })
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(400).json({ code: 'ERR_BAD_REQUEST' })
                        })
                }
                catch (err) {
                    console.log(err)
                    res.status(400).json({ code: 'ERR_BAD_REQUEST' })
                }
            }
        }
        catch (err) {
            res.sendStatus(404).json({ code: 'user not found' })
        }
    }
    else {
        res.status(401).json({ code: 'UNAUTHORISED REQUEST' })
    }
})

// delete a post and update its corresponding user
router.route('/:postId').delete(async (req, res) => {

    const { authorization } = req?.headers
    const { postId } = req?.params

    if (authorization?.length >= 200) {
        const { data } = jwtDecode(authorization)

        const { id } = data;

        const update = {
            $pull: {
                posts: postId,
            },
        };

        const options = {
            new: true, // Return the modified document rather than the original
        };

        try {
            const response = await user.findByIdAndUpdate(id, update, options)
            console.log(response) 

            // deleteFromCloudinary()

     

            post.findByIdAndDelete(postId)
                .then(response => {
                    console.log(response)
                    res.status(200).json({ response: response })
                })
                .catch(error => {
                    console.log(error)
                    res.status(404).json({ error: error })
                });

        }
        catch (error) {
            res.status(404).json({ error: error })
        }
    }
    else {
        res.status(401).json({ code: 'UNAUTHORISED REQUEST' })
    }
})

// retrieve a specific post 
router.route('/:postId').get(async (req, res) => {

    const { authorization } = req?.headers

    if (authorization?.length >= 200) {
        const { data } = jwtDecode(authorization)
        const {postId} = req?.params
        const { id } = data;

        const query = post.where({
            postCreator: id,
            _id:postId
        });

        post.findOne(query)
            .then(response => {
                console.log(response)
                res.status(200).json({ post: response})
            })
            .catch(error => {
                console.log(error)
                res.status(404).json({ error: error })
            })
    }
    else {
        res.status(401).json({ code: 'UNAUTHORISED REQUEST' })
    }
})






module.exports = router;