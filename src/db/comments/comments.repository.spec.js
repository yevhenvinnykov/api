const db = require('../models');
const Comment = db.comment;
const CommentsRepository = require('./comments.repository');
const mockingoose = require('mockingoose');

describe('COMMENTS REPOSITORY', () => {
  const mockData = {
    body: 'body',
    author: new db.mongoose.Types.ObjectId(),
    article: new db.mongoose.Types.ObjectId(),
  };

  describe('CREATE', () => {
    test('should create a comment', async () => {
      mockingoose(Comment).toReturn(mockData);

      const comment = await CommentsRepository
          .create('body', mockData.author, mockData.article);

      expect(comment.body).toBe('body');
      expect(comment.createdAt).toBeInstanceOf(Date);
      expect(comment.article).toBe(mockData.article);
      expect(comment.author).toBe(mockData.author);
    });
  });

  describe('FIND BY ARTICLE ID', () => {
    test('should find comments by article id', async () => {
      mockingoose(Comment).toReturn(Array(3).fill(mockData, 0), 'find');

      const comments = await CommentsRepository.findByArticleId(mockData.article);

      expect(comments.length).toBe(3);
    });
  });


  describe('DELETE ONE BY ID', () => {
    test('should delete the comment with the given id', async () => {
      mockingoose(Comment).toReturn({deletedCount: 1}, 'deleteOne');

      const {deletedCount} = await CommentsRepository.deleteOneById(mockData.article);

      expect(deletedCount).toBe(1);
    });
  });

  describe('FIND ONE BY', () => {
    test('should find a comment with the given field equal to the given value', async () => {
      mockingoose(Comment).toReturn(mockData, 'findOne');

      const comment = await CommentsRepository
          .findOneBy('articleId', mockData.article);

      expect(comment.body).toBe('body');
      expect(comment.article).toBe(mockData.article);
    });
  });
});
