const users = require('./app/users');
const services = require('./app/services');

const registerRoutes = (app) => {
  app.use('/users', users());
  app.use('/services', services());
};

module.exports = registerRoutes;