const db = require('../models');
const User = db.user;
const bcrypt = require('bcryptjs');
const createUserHelper = require('../oldUtils/createUser');
const updateUserHelper = require('../oldUtils/updateUserHelper');
const { NotFoundError, BadRequestError } = require('../utils/errorHandler');

class UsersService {
    static async createUser(userData) {
        const user = await createUserHelper(userData);
        if (!user) throw new Error();
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
        return user;
    }

    static async getLoggedInUser(userId) {
        const user = await User.findOne({ _id: userId });
        if (!user) throw new NotFoundError('User not found');
        return user;
    }

    static async updateUser(userId, userData) {
        const user = await User.findOne({ _id: userId }).exec();
        if (!user) throw new NotFoundError('User not found');
        const updatedUser = await updateUserHelper(user, userData);
        if (!updatedUser) throw new Error('Something went wrong while updating the user');
        return updatedUser;
    }
}

module.exports = UsersService;