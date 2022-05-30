const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;
const jwt = require('jsonwebtoken');

signUp = (req, res) => {
    new User({
        username: req.body.user.username,
        email: req.body.user.email,
        password: bcrypt.hashSync(req.body.user.password, 8)
    }).save((err, user) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        user.bio = '';
        user.image = '';
        user.favorites = [];
        user.following = [];
        user.save(err => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: 3600
            });
            res.status(200).send({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    image: user.image,
                    token: token,
                }
            });

        });
    });
};

logIn = (req, res) => {
    User.findOne({
        email: req.body.user.email
    }, (err, user) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        if (!user) {
            res.status(404).send({ error: 'User not found' });
            return;
        }
        const passwordIsValid = bcrypt.compareSync(
            req.body.user.password,
            user.password
        );
        if (!passwordIsValid) {
            res.status(401).send({
                token: null,
                message: 'Email or password is invalid'
            });
            return;
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 3600
        });
        res.status(200).send({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                image: user.image,
                token: token,
            }
        });
    });
};

getLoggedInUser = (req, res) => {
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
        }, (err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!user) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            res.status(200).send({user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                image: user.image,
                token: token,
            }});
        });
    });

};


updateUser = (req, res) => {
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
        }, (err, user) => {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            if (!user) {
                res.status(404).send({ error: 'User not found' });
                return;
            }
            for (prop in req.body.user) {
                if (prop === 'password' && req.body.user.password.length) {
                    user['password'] = bcrypt.hashSync(req.body.user.password, 8);
                    continue;
                }
                if(prop !== 'password'){
                    user[prop] = req.body.user[prop];
                }
            }
            console.log(user);
            user.save(err => {
                if (err) {
                    res.status(500).send({ error: err });
                    return;
                }
                res.status(200).send({user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    bio: user.bio,
                    image: user.image,
                    token: token,
                }});
            });
        });
    });
};

module.exports = {
    signUp,
    logIn,
    getLoggedInUser,
    updateUser
};