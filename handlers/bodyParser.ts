import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

export default (app: Koa) =>
  app.use(
    bodyParser({
      jsonLimit: '56kb'
    })
  );
