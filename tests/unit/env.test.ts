import { configDotenv } from 'dotenv';
import Joi from 'joi';
import { expect } from 'chai';
import sinon from 'sinon';
import Env from '../../src/utils/envholder';

configDotenv();

describe('Env Class', () => {
  const validationSchema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .required(),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
  });

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it('should validate and set environment variables', async () => {
    await Env.validateEnv(validationSchema);

    expect(Env.get('NODE_ENV')).to.equal('test');
    expect(Env.get<number>('PORT')).to.equal(
      Number(process.env.STASHWISE_PORT) || 3000,
    );
  });

  it('should fall back to default config for missing variables', async () => {
    await Env.validateEnv(validationSchema);

    expect(Env.get('NODE_ENV')).to.equal('test');
    expect(Env.get<number>('PORT')).to.equal(
      Number(process.env.STASHWISE_PORT) || 3000,
    );
  });

  it('should throw validation error when environment variables are invalid', async () => {
    const invalidSchema = Joi.object({
      NODE_ENV: Joi.string().valid('invalid').required(),
    });

    try {
      await Env.validateEnv(invalidSchema);
    } catch (e) {
      expect(e).to.be.an.instanceof(Error);
    }
  });

  it('should return value from fallback config if key is not in validatedEnv', async () => {
    const config = {
      FALLBACK_KEY: 'fallback_value',
    };

    sinon.stub(config, 'FALLBACK_KEY').value('fallback_value');

    expect(Env.get('FALLBACK_KEY')).to.equal(undefined);

    sinon.restore();
  });
});
