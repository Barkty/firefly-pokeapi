import { describe, it } from 'mocha';
import request from 'supertest';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import app from '../../src/config/express';
import Messages from '../../src/utils/messages';

const baseURL = '/api/v1/favourites';

describe('FAVOURITES', () => {
    describe('ADD FAVOURITES', () => {
        it('should add favourites successfully', (done: any) => {
            request(app)
            .post(`${baseURL}`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .send({
                name: "pickachu",
                imageUrl: "https://image.demo"
            })
            .end((_err, res) => {
                process.env.FAVOURITE_ONE_ID = res.body.data.name;
                expect(res.status).to.equal(StatusCodes.CREATED);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal("Pokemon added to favourites");
                expect(res.body.status).to.equal('success');
                done();
            });
        });
        it('should return error if favourites exists', (done: any) => {
            request(app)
            .post(`${baseURL}`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .send({
                name: "pickachu",
                imageUrl: "https://image.demo"
            })
            .end((_err, res) => {
                expect(res.status).to.equal(StatusCodes.BAD_REQUEST);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal("Pokemon already in favorites");
                expect(res.body.status).to.equal('error');
                done();
            });
        });
        it('should return error if name is missing', (done: any) => {
            request(app)
            .post(`${baseURL}`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .send({
                imageUrl: "https://image.demo"
            })
            .end((_err, res) => {
                expect(res.status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal("Name is required");
                expect(res.body.status).to.equal('error');
                done();
            });
        });
    })
    describe('REMOVE FAVOURITES', () => {
        it('should remove favourites successfully', (done: any) => {
            request(app)
            .delete(`${baseURL}/${process.env.FAVOURITE_ONE_ID}`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .end((_err, res) => {
                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal("Pokemon removed from favourites");
                expect(res.body.status).to.equal('success');
                done();
            });
        });
        it('should return error if favourite does not exists', (done: any) => {
            request(app)
            .delete(`${baseURL}/${process.env.FAVOURITE_ONE_ID}`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .end((_err, res) => {
                expect(res.status).to.equal(StatusCodes.BAD_REQUEST);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal("Pokemon not found in favorites");
                expect(res.body.status).to.equal('error');
                done();
            });
        });
    })
    describe('FETCH FAVOURITES', () => {
        it('should fetch favourites successfully', (done: any) => {
            request(app)
            .get(`${baseURL}/`)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .end((_err, res) => {
                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.body).to.have.property('message');
                expect(res.body).to.have.property('status');
                expect(res.body.message).to.equal(Messages.FAVOURITES_FETCHED);
                expect(res.body.status).to.equal('success');
                done();
            });
        });
    })
    describe('CONFIRM FAVOURITES', () => {
        it('should confirm favourites exists', (done: any) => {
            request(app)
            .get(`${baseURL}/${process.env.FAVOURITE_ONE_ID}`)
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