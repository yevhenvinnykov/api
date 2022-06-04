const db = require('../models');
const Article = db.article;
const User = db.user;
const Comment = db.comment;

class CommentsService {
    static async createComment(userId, slug, commentBody) {
        try {
            const authUser = await User.findOne({ _id: userId }).exec();
            const article = await Article.findOne({ slug }).exec();
            return await new Comment({
                body: commentBody,
                author: authUser._id,
                article: article._id
            }).save();
        } catch (error) {
           console.log(error);
        }
    }

    static async getComments(slug){
        try {
            const article = await Article.findOne({ slug }).exec();
            return await Comment.find({ article: article._id })
                .populate('author', 'image username bio following')
                .sort([['updatedAt', 'descending']])
                .exec();
        } catch (error) {
            console.log(error);
        }
    }

    static async deleteComment(commentId, authUserId){
        try {
            const comment = await Comment.findOne({ _id: commentId }).exec();
            if (!comment.author.equals(authUserId)) return; // TODO: Add implementation
            return await Comment.deleteOne({ _id: commentId }).exec();
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = CommentsService;