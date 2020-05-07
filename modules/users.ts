import Router from 'koa-router';

import User from '../models/User';

const router = new Router();

router.get('/', async ctx => {
  const users = await User.find();
  ctx.body = users.map(user => user.toObject());
});

export default router;
