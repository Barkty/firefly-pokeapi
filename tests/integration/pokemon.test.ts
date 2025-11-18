import { describe, it } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import app from '../../src/config/express';
import Messages from '../../src/utils/messages';

const baseURL = '/api/v1/pokemons';

describe('POKEMONS', () => {
    describe('FETCH POKEMONS', () => {
        it('should fetch pokemons successfully', (done: any) => {
            request(app)
            .get(`${baseURL}/`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .query({
                limit: 5,
                offset: 0
            })
            .end((_err, res) => {
                process.env.POKEMON_ONE = res.body.data.results.name
                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal(Messages.POKEMON_FETCHED);
                expect(res.body.status).to.equal('success');
                done();
            });
        });
    })
    describe('FILTER POKEMONS BY NAME', () => {
        it('should fetch pokemons by name', (done: any) => {
            request(app)
            .get(`${baseURL}/${process.env.POKEMON_ONE}`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .end((_err, res) => {
                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal(Messages.FAVORITE_CONFIRMED);
                expect(res.body.status).to.equal('success');
                done();
            });
        });
    })
})