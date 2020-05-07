import Koa from 'koa';
import favicon from 'koa-favicon';

export default (app: Koa) => app.use(favicon('public/favicon.ico'));
