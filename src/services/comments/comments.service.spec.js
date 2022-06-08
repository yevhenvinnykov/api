const CommentsService = require('./comments.service');
const ArticlesDB = require('../../db/articles.db');
const CommentsDB = require('../../db/comments.db');
const {BadRequestError} = require('../../utils/errorHandler');

describe('COMMENTS SERVICE', () => {
  describe('CREATE COMMENT', () => {
    test('should create a comment', async () => {
      jest.spyOn(ArticlesDB, 'findOneBy').mockReturnValue({_id: 1});
      jest.spyOn(CommentsDB, 'create').mockReturnValue({comment: 'comment'});
      const comment = await CommentsService
          .createComment({authUserId: 1, slug: 'slug', commentBody: 'comment'});
      expect(comment).toEqual({comment: 'comment'});
    });

    test('should throw an error if article was not found', async () => {
      try {
        jest.spyOn(ArticlesDB, 'findOneBy').mockReturnValue(null);
        await CommentsService.createComment({
          authUserId: 1,
          slug: 'slug',
          commentBody: 'comment',
        });
      } catch (error) {
        expect(error.message).toBe('Article not found');
      }
    });

    test('should throw an error if comment was not created', async () => {
      try {
        jest.spyOn(ArticlesDB, 'findOneBy').mockReturnValue({_id: 1});
        jest.spyOn(CommentsDB, 'create').mockReturnValue(null);
        await CommentsService.createComment({
          authUserId: 1,
          slug: 'slug',
          commentBody: 'comment',
        });
      } catch (error) {
        expect(error.message)
            .toBe('Something went wrong when creating comment');
      }
    });
  });

  describe('GET COMMENTS', () => {
    test('should return comments', async () => {
      jest.spyOn(ArticlesDB, 'findOneBy').mockReturnValue({_id: 1});
      jest.spyOn(CommentsDB, 'findByArticleId')
          .mockReturnValue([{comment: 'comment'}]);
      const comments = await CommentsService.getComments({slug: 'slug'});
      expect(comments).toEqual([{comment: 'comment'}]);
    });

    test('should throw an error if article was not found', async () => {
      try {
        jest.spyOn(ArticlesDB, 'findOneBy').mockReturnValue(null);
        await CommentsService.getComments({slug: 'slug'});
      } catch (error) {
        expect(error.message).toBe('Article not found');
      }
    });

    test('should throw an error if comments were not found', async () => {
      try {
        jest.spyOn(ArticlesDB, 'findOneBy').mockReturnValue({_id: 1});
        jest.spyOn(CommentsDB, 'findByArticleId').mockReturnValue(null);
        await CommentsService.getComments({slug: 'slug'});
      } catch (error) {
        expect(error.message).toBe('Comments not found');
      }
    });
  });

  describe('DELETE COMMENT', () => {
    beforeEach(() => {
      jest.spyOn(CommentsDB, 'findOneBy')
          .mockReturnValue({author: {equals: () => true}});
      jest.spyOn(CommentsDB, 'deleteOneById')
          .mockReturnValue({deletedCount: 1});
    });

    test('should delete a comment', async () => {
      const fn = async () => await CommentsService
          .deleteComment({commentId: 1, authUserId: 1});
      expect(fn).not.toThrow(BadRequestError);
    });

    test('should throw an error if no comment was found', async () => {
      jest.spyOn(CommentsDB, 'findOneBy').mockReturnValue(null);
      try {
        await CommentsService.deleteComment({commentId: 1, authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('Comment not found');
      }
    });

    test('should throw an error if the user is not the author', async () => {
      jest.spyOn(CommentsDB, 'findOneBy')
          .mockReturnValue({author: {equals: () => false}});
      try {
        await CommentsService.deleteComment({commentId: 1, authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('You are not authorized');
      }
    });

    test('should throw an error if the comment was not deleted', async () => {
      jest.spyOn(CommentsDB, 'deleteOneById')
          .mockReturnValue({deletedCount: 0});
      try {
        await CommentsService.deleteComment({commentId: 1, authUserId: 1});
      } catch (error) {
        expect(error.message).toBe('Something went wrong');
      }
    });
  });
});

