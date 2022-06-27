require('dotenv').config();
const ArticlesRepository = require('./articles.repository');
const db = require('../../index');
const mockingoose = require('mockingoose');
const UsersRepository = require('../users/users.repository');
const Normalizer = require('../normalizer');

const isMongo = process.env.ORM === 'MONGOOSE';
const Article = isMongo ? db.article : require('../../models/sequelize/article.model');
const mockAuthortId = isMongo ? new db.mongoose.Types.ObjectId() : 1;

describe('ARTICLES REPOSITORY', () => {
  let mockArticle;

  beforeEach(() => {
    mockArticle = {
      title: 'title',
      description: 'description',
      body: 'body',
      tagList: ['tag'],
      author: mockAuthortId,
      slug: 'title',
      favoritesCount: 0,
    };
  });

  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('CREATE', () => {
    test('should create an article', async () => {
      if (isMongo) {
        mockingoose(Article).toReturn(mockArticle);
      }
      if (!isMongo) {
        jest.spyOn(Article, 'create').mockReturnValue({
          ...mockArticle,
          id: 1,
          favorited: false,
          favoritesCount: 0,
          createdAt: new Date(),
          author: {id: mockAuthortId},
        });
      }

      const article = await ArticlesRepository.create(mockAuthortId, {
        title: 'title',
        description: 'description',
        body: 'body',
        tagList: ['tag'],
      });

      expect(article.title).toBe('title');
      expect(article.createdAt).toBeInstanceOf(Date);
      expect(article.favorited).toBe(false);
      expect(article.favoritesCount).toBe(0);
      expect(article.slug).toBe('title');
    });
  });

  describe('UPDATE', () => {
    test('should update the article, ignoring the props that aren\'t present in the schema',
        async () => {
          mockArticle.save = async function() {
            this.title = mockUpdateData.title;
          };
          if (!isMongo) {
            jest.spyOn(Article, 'findOne').mockReturnValue(mockArticle);
          }

          if (isMongo) {
            jest.spyOn(Article, 'findOne')
                .mockReturnValue({populate: () => ({exec: () => mockArticle})});
          }

          const mockUpdateData = {
            title: 'new title',
            propThatShouldBeIgnored: 'ignore me',
          };

          await ArticlesRepository.update(1, mockUpdateData);

          expect(mockArticle.title).toBe(mockUpdateData.title);
          expect(mockArticle.propThatShouldBeIgnored).toBeUndefined();
        });
  });

  describe('DELETE', () => {
    test('should delete the article', async () => {
      if (isMongo) {
        mockingoose(Article).toReturn({deletedCount: 1}, 'deleteOne');
      }
      if (!isMongo) {
        jest.spyOn(Article, 'destroy').mockReturnValue(1);
      }

      const {deletedCount} = await ArticlesRepository.delete({slug: 'slug'});

      expect(deletedCount).toBe(1);
    });
  });

  describe('FIND ONE BY', () => {
    test('find an article with the given field equal to the given value', async () => {
      if (isMongo) {
        mockingoose(Article).toReturn(mockArticle, 'findOne');
      }
      if (!isMongo) {
        jest.spyOn(Article, 'findOne').mockReturnValue({
          ...mockArticle,
          id: 1,
          author: {id: mockAuthortId},
          save: () => {},
        });
      }
      jest.spyOn(Normalizer, 'article').mockReturnValue({...mockArticle, author: {id: '1'}});
      const article = await ArticlesRepository.findOneBy('slug', 'slug');

      expect(article.title).toBe('title');
      expect(article.slug).toBe('title');
      expect(article.author.id).toEqual('1');
    });
  });

  describe('FIND', () => {
    test('find an array of article which suit the given conditions', async () => {
      const mockArticles = Array(5).fill({...mockArticle, id: 1, author: {id: mockAuthortId}}, 0);
      if (isMongo) {
        mockingoose(Article).toReturn(mockArticles, 'find');
      }
      if (!isMongo) {
        jest.spyOn(Article, 'findAll').mockReturnValue(mockArticles);
      }

      const articles = await ArticlesRepository.find({title: 'title'}, {limit: 5, offset: 0});

      expect(articles.length).toBe(5);
      expect(articles[0].title).toEqual('title');
    });
  });

  describe('COUNT', () => {
    test('return count of found documents', async () => {
      if (isMongo) {
        mockingoose(Article).toReturn(3, 'countDocuments');
      }
      if (!isMongo) {
        jest.spyOn(Article, 'count').mockReturnValue(3);
      }

      const count = await ArticlesRepository.count({title: 'title'});

      expect(count).toBe(3);
    });
  });

  describe('LIKE', () => {
    beforeEach(() => {
      if (isMongo) {
        jest.spyOn(Article, 'findOne')
            .mockReturnValue({populate: () => ({exec: () => mockArticle})});
      }
      if (!isMongo) {
        jest.spyOn(Article, 'findOne').mockReturnValue(mockArticle);
        const User = require('../../models/sequelize/user.model');
        jest.spyOn(User, 'update').mockImplementation(() => Promise.resolve());
      }
    });

    test('should increment likes', async () => {
      if (isMongo) {
        mockArticle.save = async () => mockArticle.favoritesCount = 1;
      }
      if (!isMongo) {
        jest.spyOn(Article, 'update').mockImplementation(() => mockArticle.favoritesCount = 1);
      }

      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({favorites: [], save: () => {}});

      const mockAuthUserId = 1;
      const mockArticleId = 2;
      await ArticlesRepository.like(mockAuthUserId, mockArticleId);

      expect(mockArticle.favoritesCount).toBe(1);
    });
  });

  describe('DISLIKE', () => {
    test('should decrement likes count', async () => {
      if (isMongo) {
        mockArticle.save = async () => mockArticle.favoritesCount = 0;
      }
      if (!isMongo) {
        jest.spyOn(Article, 'update').mockImplementation(() => mockArticle.favoritesCount = 0);
      }

      jest.spyOn(UsersRepository, 'findOneBy').mockReturnValue({favorites: [], save: () => {}});

      const mockAuthUserId = 1;
      const mockArticleId = 2;
      await ArticlesRepository.dislike(mockAuthUserId, mockArticleId);

      expect(mockArticle.favoritesCount).toBe(0);
    });
  });
});


