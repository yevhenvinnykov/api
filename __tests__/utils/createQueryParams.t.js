const mockingoose = require('mockingoose');
const db = require('../../models');
const User = db.user;

const createQueryParams = require('../../utils/createQueryParams');

  describe('CreateQueryParams', () => {

    it ('should add an author\'s id to the queryParams ', async () => {
      mockingoose(User).toReturn(
        {
            username: 'John',
            _id: 123,
        },
       'findOne');
      const queryMock = { author: 'John' };
      const queryParams = await createQueryParams(queryMock);
      expect((queryParams).author).toBeTruthy();
    });

    it ('should add a favorited article id to the queryParams ', async () => {
        mockingoose(User).toReturn(
          {
              username: 'John',
              _id: 123,
          },
         'findOne');
        const queryMock = { favorited: 'John' };
        const queryParams = await createQueryParams(queryMock);
        expect((queryParams)._id).toBeTruthy();
      });

      it ('should add a tagList to the queryParams ', async () => {
        const queryMock = { tag: 'tag' };
        const queryParams = await createQueryParams(queryMock);
        expect((queryParams).tagList).toBe('tag');
      });
      
  });

