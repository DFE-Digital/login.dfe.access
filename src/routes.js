const users = require('./app/users');
const invitations = require('./app/invitations');
const services = require('./app/services');

const registerRoutes = (app) => {
  app.use('/users', users());
  app.use('/invitations', invitations());
  app.use('/services', services());
};

module.exports = registerRoutes;