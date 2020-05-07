import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import config from 'config';
import jwtMiddleware from 'koa-jwt';
import { v4 } from 'uuid';
import { pick } from 'lodash';

import User from '../models/User';
import RefreshToken from '../models/RefreshToken';

const router = new Router();

interface IError extends Error {
  status?: number;
}

const issueTokenPair = async (userId: string) => {
  const newRefreshToken = v4();
  await RefreshToken.create({
    token: newRefreshToken,
    userId
  });

  return {
    token: jwt.sign({ id: userId }, config.get('secret')),
    refreshToken: newRefreshToken
  };
};

router.post('/login', async ctx => {
  const { email, password } = ctx.request.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.checkPassword(password))) {
    const error: IError = new Error();
    error.status = 403;
    throw error;
  }

  ctx.body = await issueTokenPair(user.id);
});

router.post('/refresh', async ctx => {
  const { refreshToken } = ctx.request.body;
  const dbToken = await RefreshToken.findOne({ token: refreshToken });

  if (!dbToken) {
    return;
  }

  await RefreshToken.remove({ token: refreshToken });

  ctx.body = await issueTokenPair(dbToken._id);
});

router.post('/register', async ctx => {
  const user = new User(pick(ctx.request.body, User.publicFields));
  await user.setPassword(ctx.request.body.password);
  await user.save();

  ctx.body = await issueTokenPair(user.id);
});

router.post('/logout', jwtMiddleware({ secret: config.get('secret') }), async ctx => {
  const { id: userId } = ctx.state.user;
  await RefreshToken.remove({ userId });

  ctx.body = { success: true };
});

export default router;
