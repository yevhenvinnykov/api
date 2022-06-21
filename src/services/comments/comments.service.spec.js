require('dotenv').config();
const CommentsService = require('./comments.service');
const CommentsRepository = require('../../db/repos/comments/comments.repository');
const ArticlesRepository = require('../../db/repos/articles/articles.repository');
const {BadRequestError} = require('../../middleware/errors/errorHandler');

describe('COMMENTS SERVICE', () => {
  describe('CREATE COMMENT', () => {
    test('should create a comment', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue({id: 1});
      jest.spyOn(CommentsRepository, 'create').mockReturnValue({comment: 'comment'});

      const comment = await CommentsService
          .createComment({authUserId: 1, slug: 'slug', commentBody: 'comment'});
      expect(comment).toEqual({comment: 'comment'});
    });

    test('should throw an error if article was not found', async () => {
      try {
        jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(null);
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
        jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue({id: 1});
        jest.spyOn(CommentsRepository, 'create').mockReturnValue(null);
        await CommentsService.createComment({
          authUserId: 1,
          slug: 'slug',
          commentBody: 'comment',
        });
      } catch (error) {
        expect(error.message)
            .toBe('Something went wrong while creating the comment');
      }
    });
  });

  describe('GET COMMENTS', () => {
    test('should return comments', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue({id: 1});
      jest.spyOn(CommentsRepository, 'findByArticleId')
          .mockReturnValue([{_id: 1, toJSON: () => ({comment: 'comment'})}]);
      const comments = await CommentsService.getComments({slug: 'slug'});
      expect(comments).toEqual([{id: 1, comment: 'comment'}]);
    });

    test('should throw an error if article was not found', async () => {
      try {
        jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue(null);
        await CommentsService.getComments({slug: 'slug'});
      } catch (error) {
        expect(error.message).toBe('Article not found');
      }
    });

    test('should throw an error if comments were not found', async () => {
      try {
        jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue({id: 1});
        jest.spyOn(CommentsRepository, 'findByArticleId').mockReturnValue(null);
        await CommentsService.getComments({slug: 'slug'});
      } catch (error) {
        expect(error.message).toBe('Comments not found');
      }
    });
  });

  describe('DELETE COMMENT', () => {
    beforeEach(() => {
      jest.spyOn(CommentsRepository, 'findOneBy')
          .mockReturnValue({authorId: {toString: () => '1'}});
      jest.spyOn(CommentsRepository, 'deleteOneById')
          .mockReturnValue({deletedCount: 1});
    });

    test('should delete a comment', async () => {
      jest.spyOn(CommentsRepository, 'findOneBy')
          .mockReturnValue({authorId: {toString: () => '1'}});
      const fn = async () => await CommentsService.deleteComment(1, {toString: () => '1'});
      expect(fn).not.toThrow(BadRequestError);
    });

    test('should throw an error if no comment was found', async () => {
      jest.spyOn(CommentsRepository, 'findOneBy').mockReturnValue(null);
      try {
        await CommentsService.deleteComment(1, {toString: () => '1'});
      } catch (error) {
        expect(error.message).toBe('Comment not found');
      }
    });

    test('should throw an error if the user is not the author', async () => {
      jest.spyOn(CommentsRepository, 'findOneBy')
          .mockReturnValue({authorId: {toString: () => '2'}});
      try {
        await CommentsService.deleteComment(1, {toString: () => '1'});
      } catch (error) {
        expect(error.message).toBe('You are not authorized');
      }
    });

    test('should throw an error if the comment was not deleted', async () => {
      jest.spyOn(CommentsRepository, 'deleteOneById').mockReturnValue({deletedCount: 0});
      try {
        await CommentsService.deleteComment(1, {toString: () => '1'});
      } catch (error) {
        expect(error.message).toBe('Something went wrong while deleting the comment');
      }
    });
  });
});

