require('dotenv').config();
const request = require('supertest');
const TestInitializer = require('../../../utils/TestInitializer');
const MockCreator = require('../../../utils/MockCreator');


describe('ARTICLES GETTER ROUTER: GET TAGS', () => {
  let server;

  beforeAll(async () => {
    server = await TestInitializer.initializeServer();
  });

  afterAll(async () => {
    await TestInitializer.close(server);
  });

  beforeAll(async () => {
    const articleNumbers = ['One', 'Two', 'Three', 'Four', 'Five'];
    for (const number of articleNumbers) {
      await MockCreator.createArticleMock(`Article${number}`);
    }
  });

  describe('GET /api/tags', () => {
    it('should return tags', async () => {
      const response = await request(server).get('/api/tags');

      expect(response.statusCode).toBe(200);
      expect(response.body.tags.length).toBe(1);
      expect(response.body.tags).toEqual(['lorem']);
    });
  });
});
