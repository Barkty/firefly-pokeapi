import app from '../../src/config/express';
import { describe, it } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';

describe('Integration test', () => {
  it('Health check', (done) => {
    request(app)
      .get('/health')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((_err, res) => {
        expect(res.body.message).to.equal('Okay');
        expect(res.statusCode).to.equal(200);
        done();
      });
  });
});
