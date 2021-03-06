import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import config from 'config';
import jwtMiddleware from 'koa-jwt';
import { v4 } from 'uuid';
import { pick } from 'lodash';
import path from 'path';
import sendpulse from 'sendpulse-api';

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

  // TODO: Заменить на ctx.throw
  if (!user || !(await user.checkPassword(password))) {
    const error: IError = new Error();
    error.status = 403;
    throw error;
  }

  const tokenPair = await issueTokenPair(user.id);

  ctx.body = { ...user.toObject(), ...tokenPair };
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

  sendpulse.init(config.get('sendpulse.userId'), config.get('sendpulse.secret'), __dirname, () => {
    sendpulse.smsSend((data: any) => console.log(data), 'Ravenless', [79998676941], 'test sms');
  });

  ctx.body = { success: true };
});

router.get('/check-email', async ctx => {
  const { email } = ctx.request.query;

  if (!email) {
    ctx.throw(422, 'Email не отправлен');
  }

  const user = await User.findOne({ email });

  if (user) {
    ctx.throw(404, 'Email занят');
  }

  ctx.body = { success: true };
});

router.post('/logout', jwtMiddleware({ secret: config.get('secret') }), async ctx => {
  const { id: userId } = ctx.state.user;
  await RefreshToken.remove({ userId });

  ctx.body = { success: true };
});

export default router;
