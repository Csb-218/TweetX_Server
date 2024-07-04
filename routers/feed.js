const router = require('express').Router();
const axios = require('axios')
const post = require('../models/postModel');
const { jwtDecode } = require("jwt-decode");

require('dotenv').config();

// retrieve user feed
router.route('/').get(async (req, res) => {

    const  authorization  = req?.headers?.authorization 
    
    if (authorization?.length >= 200) {
       
        try {

            const options = {
                method: 'GET',
                url: `${process.env.BASE_URL}/user/following`,
                headers: {
                    Authorization: `${authorization}`
                } 
            };
            const response = await axios.request(options)

            if (response.status === 200) {

                const { data } = jwtDecode(authorization)
                const { id } = data;
                 
                const following = response?.data?.following?.map(followed => followed?._id)

                // console.log(response,id,following)

                const idsArray = [...following,id]

                console.log(1111,idsArray,8989)

                const query ={
                        'postCreator.id': { $in: idsArray }
                }

                post.find(query).sort({ updatedAt: -1 })     
                    .then(response => {    
                        console.log(response,7777)
                        res.status(200).json({ feed: response })
                    })
                    .catch(error => {
                        console.log(error)
                        res.status(404).json({ error: 'ERR_BAD_REQUEST' })
                    })

            }

        }
        catch (err) {
            console.log(err)
            res.status(400).json({ err: 'ERR_BAD_REQUEST' })

        }
    }
    else {
        console.error(9999)
        post.find({}).then(response => {    
                        console.log(response,7777)
                        res.status(200).json({ feed: response })
                    })
                    .catch(error => {
                        console.log(error)
                        res.status(404).json({ error: 'ERR_BAD_REQUEST' })
                    })
    }
})

module.exports = router;