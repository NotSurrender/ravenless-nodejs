import Koa from 'koa';
import logger from 'koa-logger';

export default (app: Koa) => app.use(logger());
