const router = require('express').Router();
const axios = require('axios')
const post = require('../models/postModel');


require('dotenv').config();

// retrieve user feed
router.route('/').get(async (req, res) => {

    const { authorization } = req?.headers

    if (authorization) {
       
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

                const { following } = response?.data

                const query = post.where({
                    postCreator: { $in: following }
                });

                post.find(query)
                    .then(response => {
                        console.log(response)
                        res.status(200).json({ feed: response })
                    })
                    .catch(error => {
                        console.log(error)
                        res.status(404).json({ error: 'ERR_BAD_REQUEST' })
                    })
                    ;

            }

        }
        catch (err) {
            console.log(err)
            res.status(400).json({ err: 'ERR_BAD_REQUEST' })

        }
    }
    else {
        res.status(401).json({ code: 'UNAUTHORISED REQUEST' })
    }
})

module.exports = router;