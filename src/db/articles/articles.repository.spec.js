const ArticlesRepository = require('./articles.repository');
const db = require('../models');
const Article = db.article;
const mockingoose = require('mockingoose');
const mockAuthortId = new db.mongoose.Types.ObjectId();


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
    };
  });

  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('CREATE', () => {
    test('should create an article', async () => {
      mockingoose(Article).toReturn(mockArticle);

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

    describe('UPDATE', () => {
      test('should update the article, ignoring the props that aren\'t present in the schema',
          async () => {
            mockArticle.save = () => {};
            const mockUpdateData = {
              title: 'new title',
              propThatShouldBeIgnored: 'ignore me',
            };

            const updatedArticle = await ArticlesRepository.update(mockArticle, mockUpdateData);

            expect(updatedArticle.title).toBe('new title');
            expect(updatedArticle.propThatShouldBeIgnored).toBeUndefined();
          });
    });

    describe('DELETE', () => {
      test('should delete the article', async () => {
        mockingoose(Article).toReturn({deletedCount: 1}, 'deleteOne');

        const {deletedCount} = await ArticlesRepository.delete({slug: 'slug'});

        expect(deletedCount).toBe(1);
      });
    });

    describe('FIND ONE BY', () => {
      test('find an article with the given field equal to the given value', async () => {
        mockingoose(Article).toReturn(mockArticle, 'findOne');

        const article = await ArticlesRepository.findOneBy('slug', 'slug');

        expect(article.title).toBe('title');
        expect(article.slug).toBe('title');
        expect(article.author).toEqual(mockAuthortId);
      });
    });

    describe('FIND', () => {
      test('find an array of article which suit the given conditions', async () => {
        const mockArticles = Array(5).fill(mockArticle, 0);
        mockingoose(Article).toReturn(mockArticles, 'find');

        const articles = await ArticlesRepository.find({title: 'title'}, {limit: 5, offset: 0});

        expect(articles.length).toBe(5);
        expect(articles[0].title).toEqual('title');
      });
    });

    describe('COUNT', () => {
      test('return count of found documents', async () => {
        mockingoose(Article).toReturn(3, 'countDocuments');

        const count = await ArticlesRepository.count({title: 'title'});

        expect(count).toBe(3);
      });
    });
  });
});


