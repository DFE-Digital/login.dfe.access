const users = require('./app/users');
const invitations = require('./app/invitations');
const services = require('./app/services');

const registerRoutes = (app) => {
  app.use('/acc/users', users());
  app.use('/acc/invitations', invitations());
  app.use('/acc/services', services());
};

module.exports = registerRoutes;