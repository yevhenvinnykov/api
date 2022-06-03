const mongoose = require('mongoose');

const defaultUserImage = 'https://st3.depositphotos.com/2229436/13671/v/600/depositphotos_136717406-stock-illustration-flat-user-icon-member-sign.jpg';

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    token: String,
    password: String,
    bio: { type: String, default: '' },
    image: { type: String, default: defaultUserImage },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: [] }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
