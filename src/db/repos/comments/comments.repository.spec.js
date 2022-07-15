require('dotenv').config();
const db = require('../../index');
const CommentsRepository = require('./index');
const mockingoose = require('mockingoose');
const Normalizer = require('../normalizer');

const isMongo = process.env.ORM === 'MONGOOSE';
const Comment = isMongo
  ? require('../../models/mongoose/comment.model')
  : require('../../models/sequelize/comment.model');

describe('COMMENTS REPOSITORY', () => {
  const mockData = {
    id: 1,
    body: 'body',
    author: isMongo ? new db.mongoose.Types.ObjectId() : 1,
    article: isMongo ? new db.mongoose.Types.ObjectId() : 1,
  };

  describe('CREATE', () => {
    test('should create a comment', async () => {
      if (isMongo) {
        mockingoose(Comment).toReturn(mockData).toReturn(mockData, 'findOne');
      }
      if (!isMongo) {
        jest
          .spyOn(Comment, 'create')
          .mockImplementation(() => Promise.resolve(1));
        jest.spyOn(Comment, 'findOne').mockReturnValue(mockData);
      }

      jest.spyOn(Normalizer, 'comment').mockReturnValue(mockData);

      const comment = await CommentsRepository.create(
        'body',
        mockData.author,
        mockData.article
      );

      expect(comment.body).toBe('body');
      expect(comment.article).toBe(mockData.article);
      expect(comment.author).toBe(mockData.author);
    });
  });

  describe('FIND BY ARTICLE ID', () => {
    test('should find comments by article id', async () => {
      if (isMongo) {
        mockingoose(Comment).toReturn(Array(3).fill(mockData, 0), 'find');
      }
      if (!isMongo) {
        jest
          .spyOn(Comment, 'findAll')
          .mockReturnValue(Array(3).fill(mockData, 0));
      }

      const comments = await CommentsRepository.findByArticleId(
        mockData.article
      );

      expect(comments.length).toBe(3);
    });
  });

  describe('DELETE ONE BY ID', () => {
    test('should delete the comment with the given id', async () => {
      if (isMongo) {
        mockingoose(Comment).toReturn({ deletedCount: 1 }, 'deleteOne');
      }
      if (!isMongo) {
        jest.spyOn(Comment, 'destroy').mockReturnValue(1);
      }

      const { deletedCount } = await CommentsRepository.deleteOneById(
        mockData.article
      );

      expect(deletedCount).toBe(1);
    });
  });

  describe('FIND ONE BY', () => {
    test('should find a comment with the given field equal to the given value', async () => {
      if (isMongo) {
        mockingoose(Comment).toReturn(mockData, 'findOne');
      }
      if (!isMongo) {
        jest.spyOn(Comment, 'findOne').mockReturnValue(mockData);
      }

      const comment = await CommentsRepository.findOneBy(
        'articleId',
        mockData.article
      );

      expect(comment.body).toBe('body');
      expect(comment.article).toEqual(mockData.article);
    });
  });
});
