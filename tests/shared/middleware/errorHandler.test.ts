import request from 'supertest';
import { createApp } from '../../../src/app';

const app = createApp();

describe('error handling', () => {
  it('should return RFC 9457 validation response when query params are invalid', async () => {
    const response = await request(app)
      .get('/api/flights/search?maxDuration=-1')
      .expect(400)
      .expect('Content-Type', /application\/problem\+json/);

    expect(response.body).toMatchObject({
      code: 'validation_failed',
      status: 400,
      instance: '/api/flights/search?maxDuration=-1',
      errors: { maxDuration: ['Invalid input: must be a positive number.'] },
    });
  });

  it('should return a generic 500 response when a non-Error is rejected', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce('timeout');

    const response = await request(app)
      .get('/api/flights/search')
      .expect(500)
      .expect('Content-Type', /application\/problem\+json/);

    expect(response.body).toMatchObject({
      code: 'internal_server_error',
      status: 500,
      detail: 'An unexpected error occurred while processing the request.',
    });
    expect(response.body).not.toHaveProperty('stack');
  });
});
