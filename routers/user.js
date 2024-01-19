const router = require('express').Router();
const jwt = require('jsonwebtoken')
const user = require('../models/userModel');
const { jwtDecode } = require("jwt-decode");

//  retrieve user
router.route('/').get(async(req, res) => {
  const { authorization } = req?.headers

  if (authorization) {
    const { data } = jwtDecode(authorization)

    const { id } = data;

    try {
      // get user details
      const userObject= await user.findById(id)
      userObject && res.status(200).json({user:userObject})
    }
    catch (error) {
      res.status(400).json({message : 'ERR_BAD_REQUEST'})
    }
  }
  else {
    res.status(401).json({message : 'UNAUTHORISED'})
  }
});

// user registration
router.route('/register').post(async (req, res) => {
  const { userName, password, email } = req.body
  console.log(userName, password, email)
  const newUser = new user({
    userName,
    password,
    email
  })

  newUser.save()
    .then((response) => {
      console.log(response, 22)
      res.status(200).send('user Registered')
    })
    .catch((error) => {
      console.log(error, 26)
      res.status(400).json({ message: 'ERR_BAD_REQUEST' })
    })

})

// user login
router.route('/login').get(async (req, res) => {
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
    ;

  // user.findOne(userName,password)

})

// follow a user
router.route('/follow/:userId').post(async (req, res) => {

  const { authorization } = req?.headers
  const { userId } = req?.params

  if (authorization) {
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
      const followRes = await user.findByIdAndUpdate(id, updateFollowing , options)
      // adding user into another user's followers list
      const followerResult = await user.findByIdAndUpdate(userId, updateFollower , options)

      followRes && followerResult && res.status(200).json({following:followRes,followers:followerResult})
    }
    catch (error) {
      res.status(400).json({message : 'ERR_BAD_REQUEST'})
    }
  }
  else {
    res.status(401).json({message : 'UNAUTHORISED'})
  }


})

// unfollow a user
router.route('/unfollow/:userId').post(async (req, res) => {

  const { authorization } = req?.headers
  const { userId } = req?.params

  if (authorization) {
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
      const followRes = await user.findByIdAndUpdate(id, updateFollowing , options)
      // adding user into another user's followers list
      const followerResult = await user.findByIdAndUpdate(userId, updateFollower , options)

      followRes && followerResult && res.status(200).json({following:followRes,followers:followerResult})
    }
    catch (error) {
      res.status(400).json({message : 'ERR_BAD_REQUEST'})
    }
  }
  else {
    res.status(401).json({message : 'UNAUTHORISED'})
  }


})

// retrieve followers
router.route('/followers').get(async (req, res) => {

  const { authorization } = req?.headers
  const { userId } = req?.params

  if (authorization) {
    const { data } = jwtDecode(authorization)

    const { id, userName, email } = data;

    try {
      // find followers
      const {followers} = await user.findById(id)

      followers && res.status(200).json({followers:followers})
    }
    catch (error) {
      res.status(400).json({message : 'ERR_BAD_REQUEST'})
    }
  }
  else {
    res.status(401).json({message : 'UNAUTHORISED'})
  }
})

// retrieve following
router.route('/following').get(async (req, res) => {

  const { authorization } = req?.headers

  if (authorization) {
    const { data } = jwtDecode(authorization)

    const { id, userName, email } = data;

    try {
      // find followers
      const {following} = await user.findById(id)

      following && res.status(200).json({following:following})
    }
    catch (error) {
      res.status(400).json({message : 'ERR_BAD_REQUEST'})
    }
  }
  else {
    res.status(401).json({message : 'UNAUTHORISED'})
  }
})



module.exports = router;
