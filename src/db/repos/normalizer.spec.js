const Normalizer = require('./normalizer');

describe('NORMALIZER', () => {
  describe('ARTICLE', () => {
    const mockEntry = {
      _id: { toString: () => '1' },
      id: { toString: () => '1' },
      slug: 'slug',
      title: 'title',
      description: 'description',
      body: 'body',
      tagList: ['tag'],
      createdAt: new Date(),
      updatedAt: new Date(),
      favorited: false,
      favoritesCount: 1,
      ormMethod: 'ormMethod',
      ormProp: 'ormProp',
      author: {
        _id: { toString: () => '1' },
        id: { toString: () => '1' },
        username: 'author',
        bio: 'bio',
        image: 'image',
        following: [5],
        ormMethod: 'ormMethod',
        ormProp: 'ormProp',
      },
    };

    const expectedData = {
      id: '1',
      slug: 'slug',
      title: 'title',
      description: 'description',
      body: 'body',
      tagList: ['tag'],
      createdAt: new Date(),
      updatedAt: new Date(),
      favorited: false,
      favoritesCount: 1,
      author: {
        id: '1',
        username: 'author',
        bio: 'bio',
        image: 'image',
        following: [5],
      },
    };
    test('should normalize article', () => {
      expect(Normalizer.article(mockEntry)).toEqual(expectedData);
    });
  });

  describe('USER', () => {
    const mockEntry = {
      _id: { toString: () => '1' },
      id: { toString: () => '1' },
      bio: 'bio',
      image: 'image',
      username: 'username',
      following: [{ _id: { toString: () => '5' }, toString: () => '5' }],
      favorites: [{ _id: { toString: () => '10' }, toString: () => '10' }],
      password: 'password',
      ormMethod: 'ormMethod',
      ormProp: 'ormProp',
    };

    const expectedData = {
      id: '1',
      bio: 'bio',
      image: 'image',
      username: 'username',
      following: ['5'],
      favorites: ['10'],
      password: 'password',
    };

    test('should normalize user', () => {
      expect(Normalizer.user(mockEntry)).toEqual(expectedData);
    });
  });

  describe('PROFILE', () => {
    const mockEntry = {
      _id: { toString: () => '1' },
      id: { toString: () => '1' },
      bio: 'bio',
      image: 'image',
      username: 'username',
      following: true,
      ormMethod: 'ormMethod',
      ormProp: 'ormProp',
    };

    const expectedData = {
      id: '1',
      bio: 'bio',
      image: 'image',
      username: 'username',
      following: true,
    };
    test('should normalize profile', () => {
      expect(Normalizer.profile(mockEntry)).toEqual(expectedData);
    });
  });

  describe('COMMENT', () => {
    const mockEntry = {
      _id: { toString: () => '1' },
      id: { toString: () => '1' },
      createdAt: new Date(),
      updatedAt: new Date(),
      body: 'body',
      articleId: { toString: () => '1' },
      article: { _id: { toString: () => '1' } },
      ormMethod: 'ormMethod',
      ormProp: 'ormProp',
      author: {
        id: { toString: () => '1' },
        _id: { toString: () => '1' },
        username: 'username',
        bio: 'bio',
        image: 'image',
      },
    };

    const expectedData = {
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      body: 'body',
      article: '1',
      author: {
        id: '1',
        username: 'username',
        bio: 'bio',
        image: 'image',
      },
    };
    test('should normalize profile', () => {
      expect(Normalizer.comment(mockEntry)).toEqual(expectedData);
    });
  });

  describe('NO ENTRY', () => {
    test('should return undefined if no entry is provided', () => {
      expect(Normalizer.article(null)).toBeUndefined();
      expect(Normalizer.user(null)).toBeUndefined();
      expect(Normalizer.profile(null)).toBeUndefined();
      expect(Normalizer.comment(null)).toBeUndefined();
    });
  });
});
