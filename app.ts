import Koa from 'koa';
import Router from 'koa-router';
import jwtMiddleware from 'koa-jwt';
import config from 'config';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';

const app = new Koa();

require('./handlers/favicon').default(app);
require('./handlers/logger').default(app);
require('./handlers/errors').default(app);
require('./handlers/bodyParser').default(app);

const router = new Router();

router.use('/auth', authRoutes.routes());
router.use(
  jwtMiddleware({
    secret: config.get('secret')
  })
);
router.use('/users', userRoutes.routes());

app.use(router.routes());

export default app;
