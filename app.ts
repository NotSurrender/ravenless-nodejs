import Koa from 'koa';
import Router from 'koa-router';
import jwtMiddleware from 'koa-jwt';
import config from 'config';

import authModule from './modules/auth';
import usersModule from './modules/users';

const app = new Koa();

require('./handlers/favicon').default(app);
require('./handlers/logger').default(app);
require('./handlers/errors').default(app);
require('./handlers/bodyParser').default(app);

const router = new Router();

router.use('/auth', authModule.routes());
router.use(
  jwtMiddleware({
    secret: config.get('secret')
  })
);
router.use('/users', usersModule.routes());

app.use(router.routes());

export default app;
