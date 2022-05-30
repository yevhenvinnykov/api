const db = require('../models');
const User = db.user;
const jwt = require('jsonwebtoken');

getProfile = (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: 3600
    }, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        User.findOne({
            _id: decoded.id
        }, (err, authUser) => {
            User.findOne({
                username: req.params['username']
            }, (err, user) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                if (!user) {
                    res.status(404).send({ error: 'User not found' });
                    return;
                }
                res.status(200).send({
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                    following: authUser.following.some(u => u._id.equals(user._id))
                })
            });
        })
    })
};


followProfile = (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: 3600
    }, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        User.findOne({
            _id: decoded.id
        }, (err, authUser) => {
            User.findOne({
                username: req.params['username']
            }, (err, user) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                if (!user) {
                    res.status(404).send({ error: 'User not found' });
                    return;
                }
                authUser.following.push(user);
                authUser.save((err, user) => {
                    if (err) {
                        res.status(500).send({ error: err });
                        return;
                    }
                    res.status(200).send({
                        username: user.username,
                        bio: user.bio,
                        image: user.image,
                        following: true
                    })
                });
            });
        })
    })
};


unfollowProfile = (req, res) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ error: 'No token provided' });
    }
    jwt.verify(token, process.env.JWT_SECRET, {
        expiresIn: 3600
    }, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        User.findOne({
            _id: decoded.id
        }, (err, authUser) => {
            User.findOne({
                username: req.params['username']
            }, (err, user) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                if (!user) {
                    res.status(404).send({ error: 'User not found' });
                    return;
                }
                const index = authUser.following.findIndex(u => u._id.equals(user._id));

                authUser.following.splice(index, 1);
                authUser.save((err, user) => {
                    if (err) {
                        res.status(500).send({ error: err });
                        return;
                    }
                    res.status(200).send({
                        username: user.username,
                        bio: user.bio,
                        image: user.image,
                        following: false
                    })
                });
            });
        })
    })
};


module.exports = {
    getProfile,
    followProfile,
    unfollowProfile
};