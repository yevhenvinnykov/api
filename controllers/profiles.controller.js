const db = require('../models');
const User = db.user;

getProfile = (req, res) => {
    User.findOne({
        _id: req.userId
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
                profile: {
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                    following: authUser.following.some(u => u._id.equals(user._id))
                }
            });
        });
    });
};


followProfile = (req, res) => {
    User.findOne({
        _id: req.userId
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
            const response = {
                profile: {
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                    following: true
                }
            };
            if (authUser.following.find(u => u.equals(user._id))) {
                res.status(200).send(response);
                return;
            }
            authUser.following.push(user._id);
            authUser.save((err, user) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                res.status(200).send(response);
            });
        });
    });
};



unfollowProfile = (req, res) => {
    User.findOne({
        _id: req.userId
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
            const response = {
                profile: {
                    username: user.username,
                    bio: user.bio,
                    image: user.image,
                    following: false
                }
            };
            const index = authUser.following.findIndex(id => id.equals(user._id));
            if(index === -1){
                res.status(200).send(response);
                return;
            }
            authUser.following.splice(index, 1);
            authUser.save((err, user) => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                res.status(200).send(response);
            });
        });
    });
};


module.exports = {
    getProfile,
    followProfile,
    unfollowProfile
};