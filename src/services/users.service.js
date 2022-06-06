const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NotFoundError, BadRequestError } = require('../utils/errorHandler');

class UsersService {

    static async createUser({ userData }) {
        await new User({
            username: userData.username,
            email: userData.email,
            password: bcrypt.hashSync(userData.password, 8),
        }).save();
        const user = await User.findOne({ email: userData.email }).select('username email token bio image');
        if (!user) throw new BadRequestError('Something went wrong when creating the user');
        user.token = UsersService.#createToken(user.id);
        await user.save();
        return user;
    }

    static async getLoggedInUser({ authUserId }) {
        const user = await User.findOne({ _id: authUserId }).select('username email token bio image');
        if (!user) throw new NotFoundError('User not found');
        return user;
    }

    static async updateUser({ authUserId, userData }) {
        const user = await User.findOne({ _id: authUserId }).select('username email token bio image');
        if (!user) throw new NotFoundError('User not found');
        for (const prop in userData) {
            if (prop === 'password') {
                user['password'] = bcrypt.hashSync(userData.password, 8);
                continue;
            }
            user[prop] = userData[prop];
        }
        user.token = UsersService.#createToken(user.id);
        await user.save();
        return user;
    }

    static async logIn(email, password) {
        const user = await User.findOne({ email }).exec();
        if (!user) throw new NotFoundError('User not found');
        const passwordIsValid = bcrypt.compareSync(
            password,
            user.password
        );
        if (!passwordIsValid) throw new BadRequestError('Email or password is not valid');
        user.token = UsersService.#createToken(user.id);
        await user.save();
        return user;
    }

    static #createToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET = 'secret', { expiresIn: 3600 });
    }
}

module.exports = UsersService;