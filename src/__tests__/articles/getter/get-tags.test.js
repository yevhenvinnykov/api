const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');

const MockCreator = require('../../utils/MockCreator');
const cleanUpDB = require('../../utils/cleanUpDB');


describe('ARTICLES GETTER ROUTER: GET TAGS', () => {
  let server;

  beforeAll(async () => {
    await cleanUpDB();
    server = app.listen(3006);
  });

  afterAll(async () => {
    await cleanUpDB();
    await mongoose.connection.close();
    await server.close();
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
