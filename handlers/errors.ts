import Koa from 'koa';

export default (app: Koa) =>
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      if (error.status) {
        ctx.body = error.message;
        ctx.status = error.status;
      } else if (error.name === 'ValidationError') {
        ctx.status = 400;

        let errors: any = {};

        for (let field in error.errors) {
          errors[field] = error.errors[field].message;
        }

        ctx.body = { errors };
      } else {
        ctx.body = 'Error 500';
        ctx.status = 500;
        console.error(error.message, error.stack);
      }
    }
  });
