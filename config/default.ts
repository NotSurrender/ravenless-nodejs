export default {
  port: 3000,
  secret: 'mysecret',
  root: process.cwd(),
  crypto: {
    hash: {
      length: 128,
      iterations: 10
    }
  },
  mongodb: {
    debug: true,
    uri: 'mongodb://localhost/ravenless'
  }
};
