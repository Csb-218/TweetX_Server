const router = require('express').Router();
const user = require('../models/userModel');
const post = require('../models/postModel');
const { jwtDecode } = require("jwt-decode");
const uploadToCloudinary = require('../controllers/cloudinary')
const upload = require('../middleware/multer')

// retrieve all posts of a user
router.route('/').get(async (req, res) => {

    const { authorization } = req?.headers

    if (authorization) {

        const { data } = jwtDecode(authorization)

        const { id, userName, email } = data;

        const query = post.where({
            postCreator: id
        });

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
   
    if (authorization) {

        const { postContent } = req?.body
        const { data } = jwtDecode(authorization)
        const { id } = data;

        try {
            const isUser = await user.findById(id);

            if (isUser) {
                // image upload result
                const result = await uploadToCloudinary(Imagefile?.file);
                const {secure_url} = await result;

                const newPost =  new post({
                    postContent: postContent,
                    postPicture: secure_url,
                    postCreator: id
                })

                try {
                    const response = await newPost.save();
                    const { _id } = response
                    console.log(response)

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
                            res.status(200).json({ code: 'post created successfully !' })
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

    if (authorization) {
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

    if (authorization) {
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