require('dotenv').config();
const CommentsService = require('./comments.service');
const CommentsRepository = require('../../db/repos/comments/index');
const ArticlesRepository = require('../../db/repos/articles/index');
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
        expect(error.message).toBe('Something went wrong while creating the comment');
      }
    });
  });

  describe('GET COMMENTS', () => {
    test('should return comments', async () => {
      jest.spyOn(ArticlesRepository, 'findOneBy').mockReturnValue({id: 1});
      jest.spyOn(CommentsRepository, 'findByArticleId')
          .mockReturnValue([{body: 'comment1'}, {body: 'comment2'}]);

      const comments = await CommentsService.getComments({slug: 'slug'});

      expect(comments[0].body).toEqual('comment1');
      expect(comments.length).toBe(2);
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
    const mockCommentId = 3;
    const mockAuthUserId = 1;

    beforeEach(() => {
      jest.spyOn(CommentsRepository, 'findOneBy')
          .mockReturnValue({id: mockCommentId, author: {id: mockAuthUserId}});
      jest.spyOn(CommentsRepository, 'deleteOneById').mockReturnValue({deletedCount: 1});
    });

    test('should delete a comment', async () => {
      const fn = async () => await CommentsService.deleteComment(mockCommentId, mockAuthUserId);
      expect(fn).not.toThrow(BadRequestError);
    });

    test('should throw an error if no comment was found', async () => {
      jest.spyOn(CommentsRepository, 'findOneBy').mockReturnValue(null);
      try {
        await CommentsService.deleteComment(mockCommentId, mockAuthUserId);
      } catch (error) {
        expect(error.message).toBe('Comment not found');
      }
    });

    test('should throw an error if the user is not the author', async () => {
      jest.spyOn(CommentsRepository, 'findOneBy').mockReturnValue({author: 10});
      try {
        await CommentsService.deleteComment(mockCommentId, mockAuthUserId);
      } catch (error) {
        expect(error.message).toBe('You are not authorized');
      }
    });

    test('should throw an error if the comment was not deleted', async () => {
      jest.spyOn(CommentsRepository, 'deleteOneById').mockReturnValue({deletedCount: 0});
      try {
        await CommentsService.deleteComment(mockCommentId, mockAuthUserId);
      } catch (error) {
        expect(error.message).toBe('Something went wrong while deleting the comment');
      }
    });
  });
});

