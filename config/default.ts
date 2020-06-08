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
  },
  sendpulse: {
    userId: 'b1922d7bf1915aa05bb1b377a63a3eff',
    secret: 'fd2bbd80b7cc2902a9101f2e613022f7'
  }
};
