const db = require('../models');
const User = db.user;

module.exports = async (query) => {
    const queryParams = {};
    
    if (query.author) {
        const user = await User.findOne({ username: query.author });
        queryParams.author = user._id;
    }

    if (query.favorited) {
        const user = await User.findOne({ username: query.favorited });
        queryParams._id = { $in: user.favorites };
    }

    if (query.tag) {
        queryParams.tagList = query.tag;
    }

    return queryParams;
};


