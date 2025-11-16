import development from './development';
import production from './production';
import test from './test';

export default {
  development,
  production,
  test,
  staging: test,
}[process.env.FIREFLY_NODE_ENV || 'development'];