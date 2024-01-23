const router = require('express').Router();
const jwt = require('jsonwebtoken')
const user = require('../models/userModel');
const { jwtDecode } = require("jwt-decode");
const {uploadToCloudinary} = require('../controllers/cloudinary')
const upload = require('../middleware/multer')

//  retrieve user
router.route('/').get(async (req, res) => {
  const { authorization } = req?.headers
  console.log(authorization?.length)
  if (authorization?.length >= 200) {
    const { data } = jwtDecode(authorization)

    const { id } = data;

    try {
      // get user details
      const userObject = await user.findById(id)
      userObject && res.status(200).json({ user: userObject })
    }
    catch (error) {
      res.status(400).json({ message: 'ERR_BAD_REQUEST' })
    }
  }
  else {
    res.status(401).json({ message: 'UNAUTHORISED' })
  }
});

// retrieve all users
router.route('/all').get(async (req, res) => {

  const { authorization } = req?.headers

  if (authorization?.length >= 200) {

    try {
      // get user details
      const { data } = jwtDecode(authorization)
      const { id } = data;

      const condition = {
        _id : {$ne : id}
      }
      const allUsers = await user.find(condition)
      console.log(allUsers)
      res.status(200).json({ users: allUsers })
    }
    catch (error) {
      console.error(error)
      res.status(400).json({ message: 'ERR_BAD_REQUEST' })
    }
  }
  else {
    res.status(401).json({ message: 'UNAUTHORISED' })
  }
})

// user registration
router.route('/register').post(upload.single('profilePicture'), async (req, res) => {
  const { userName, password, email } = req.body

  const Imagefile = {
    fileName: req?.file?.filename,
    file: req?.file?.buffer
  }

  const condition = {
    $or:[
      {
        userName:userName
      },
      {
        email:email
      }
    ]
  }

  try {
    console.log(9090)
    const response = await user.find(condition)
    console.log(response)
    if (response?.length !== 0) {
      res.status(409).json({ message: 'user already exists' })
    }
    else {

      const  file  = Imagefile?.file
      const result = await uploadToCloudinary(file);
      
      const { secure_url } = await result;

      console.log(file,secure_url)

      const newUser = new user({
        'userName': userName,
        'password': password,
        'email': email,
        'profilePicture': secure_url
      })

      newUser.save()
        .then((response) => {

          const { userName, email, _id } = response

          const token = jwt.sign({
            expiresIn: 60 * 60,
            data: {
              userName: userName,
              email: email,
              id: _id
            },
          }, 'secret')


          res.status(200).json({
            message: 'user registered',
            token: token
          })

        })
        .catch((error) => {
          console.log(error, 26)
          res.status(400).json({ message: 'ERR_BAD_REQUEST' })
        })
    }

  }
  catch (error) {

  }



})

// user login
router.route('/login').post(async (req, res) => {
  const { email, password } = req.body
  const query = user.where({
    email: email,
    password: password
  });

  query.findOne()
    .then(response => {
      console.log(response)

      const { userName, email, _id } = response

      const token = jwt.sign({
        expiresIn: 60 * 60,
        data: {
          userName: userName,
          email: email,
          id: _id
        },
      }, 'secret')


      res.status(200).json({ token: token })
    })
    .catch(error => {
      console.log(error)
      res.status(404).json({ error: 'Incorrect password or username' })
    })
})

// user update
router.route('/update').patch(upload.single('profilePicture'), async (req, res) => {

  const { authorization } = req?.headers

  const Imagefile = {
    fileName: req?.file?.filename,
    file: req?.file?.buffer
  }

  if (authorization?.length >= 200) {

    const { userName, email } = req?.body
    const { data } = jwtDecode(authorization)
    const { id } = data;

    try {
      const isUser = await user.findById(id);

      if (isUser) {

        const { file } = Imagefile
        const result = await uploadToCloudinary(file);
        const { secure_url } = await result;

        const update = {
          $set: {
            userName: userName,
            email: email,
            profilePicture: secure_url,
          }
        }

        const options = {
          new: true, // Return the modified document rather than the original
        };

        user.findByIdAndUpdate(id, update, options)
          .then(response => {
            console.log(response)
            res.status(200).json({ user: response })
          })
          .catch(error => {
            console.log(error)
            res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
          })
      }
      else {
        res.status(404).json({ error: 'user not found' })
      }
    }
    catch (error) {
      res.status(404).json({ error: 'user not found' })
    }
  }
  else {
    res.status(401).json({ error: 'UNAUTHORISED' })
  }


})

// follow a user
router.route('/follow/:userId').get(async (req, res) => {

  const { authorization } = req?.headers
  const { userId } = req?.params

  if (authorization?.length >= 200) {
    const { data } = jwtDecode(authorization)

    const { id, userName, email } = data;

    const updateFollowing = {
      $push: {
        following: userId,
      },
    };

    const updateFollower = {
      $push: {
        followers: id,
      },
    };

    const options = {
      new: true, // Return the modified document rather than the original
    };

    try {
      // adding another user into user's following list
      const followRes = await user.findByIdAndUpdate(id, updateFollowing, options)
      // adding user into another user's followers list
      const followerResult = await user.findByIdAndUpdate(userId, updateFollower, options)

      followRes && followerResult && res.status(200).json({ following: followRes, followers: followerResult })
    }
    catch (error) {
      res.status(400).json({ message: 'ERR_BAD_REQUEST' })
    }
  }
  else {
    res.status(401).json({ message: 'UNAUTHORISED' })
  }


})

// unfollow a user
router.route('/unfollow/:userId').get(async (req, res) => {

  const { authorization } = req?.headers
  const { userId } = req?.params

  if (authorization?.length >= 200) {
    const { data } = jwtDecode(authorization)

    const { id, userName, email } = data;

    const updateFollowing = {
      $pull: {
        following: userId,
      },
    };

    const updateFollower = {
      $pull: {
        followers: id,
      },
    };

    const options = {
      new: true, // Return the modified document rather than the original
    };

    try {
      // adding another user into user's following list
      const followRes = await user.findByIdAndUpdate(id, updateFollowing, options)
      // adding user into another user's followers list
      const followerResult = await user.findByIdAndUpdate(userId, updateFollower, options)

      followRes && followerResult && res.status(200).json({ following: followRes, followers: followerResult })
    }
    catch (error) {
      res.status(400).json({ message: 'ERR_BAD_REQUEST' })
    }
  }
  else {
    res.status(401).json({ message: 'UNAUTHORISED' })
  }


})

// retrieve followers
router.route('/followers').get(async (req, res) => {

  const { authorization } = req?.headers
  const { userId } = req?.params

  if (authorization?.length >= 200) {
    const { data } = jwtDecode(authorization)

    const { id, userName, email } = data;

    try {
      // find followers
      const { followers } = await user.findById(id)

      const query = user.where({
        _id: { $in: followers }
      });

      user.find(query)
        .then(response => {
          console.log(response)
          res.status(200).json({ followers: response })
        })
        .catch(error => {
          console.log(error)
          res.status(404).json({ error: 'ERR_BAD_REQUEST' })
        });

    }
    catch (error) {
      res.status(400).json({ message: 'ERR_BAD_REQUEST' })
    }
  }
  else {
    res.status(401).json({ message: 'UNAUTHORISED' })
  }
})

// retrieve following
router.route('/following').get(async (req, res) => {

  const { authorization } = req?.headers
   
  if (authorization?.length >= 200) {
    const { data } = jwtDecode(authorization)

    const { id, userName, email } = data;

    try {
      // find followers
      const { following } = await user.findById(id)

      const query = user.where({
        _id: { $in: following }
      });

      user.find(query)
        .then(response => {
          console.log(response)
          res.status(200).json({ following: response })
        })
        .catch(error => {
          console.log(error)
          res.status(404).json({ error: 'ERR_BAD_REQUEST' })
        });


    }
    catch (error) {
      res.status(400).json({ message: 'ERR_BAD_REQUEST' })
    }
  }
  else {
    res.status(401).json({ message: 'UNAUTHORISED' })
  }
})



module.exports = router;
