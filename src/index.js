const express = require('express');
const logger = require('./infrastructure/logger');
const https = require('https');
const config = require('./infrastructure/config');
const helmet = require('helmet');
const healthCheck = require('login.dfe.healthcheck');
const registerRoutes = require('./routes');
const { getErrorHandler } = require('login.dfe.express-error-handling');
const apiAuth = require('login.dfe.api.auth');
const configSchema = require('./infrastructure/config/schema');

configSchema.validate();

const app = express();
app.use(helmet({
  noCache: true,
  frameguard: {
    action: 'deny',
  },
}));

logger.info('set helmet policy defaults');

// Setting helmet Content Security Policy
const scriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost', '*.signin.education.gov.uk', 'https://code.jquery.com'];

app.use(helmet.contentSecurityPolicy({
  browserSniff: false,
  setAllHeaders: false,
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    childSrc: ["'none'"],
    objectSrc: ["'none'"],
    scriptSrc: scriptSources,
    styleSrc: ["'self'", "'unsafe-inline'", 'localhost', '*.signin.education.gov.uk'],
    imgSrc: ["'self'", 'data:', 'blob:', 'localhost', '*.signin.education.gov.uk'],
    fontSrc: ["'self'", 'data:', '*.signin.education.gov.uk'],
    connectSrc: ["'self'"],
    formAction: ["'self'", '*'],
  },
}));

logger.info('Set helmet filters');

app.use(helmet.xssFilter());
app.use(helmet.frameguard('false'));
app.use(helmet.ieNoOpen());

logger.info('helmet setup complete');


if (config.hostingEnvironment.env !== 'dev') {
  app.set('trust proxy', 1);

}

if (config.hostingEnvironment.env === 'dev') {
  app.use((req, res, next) => {
    req.url = req.url.replace(/[/]+/g, '/');
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use((req, res, next) => {
  req.correlationId = req.get('x-correlation-id') || `accci-${Date.now()}`;
  next();
});

app.use('/healthcheck', healthCheck({
  config,
}));
if (config.hostingEnvironment.env !== 'dev') {
  app.use(apiAuth(app, config));
}
registerRoutes(app);

// Error handing
app.use(getErrorHandler({
  logger,
}));

if (config.hostingEnvironment.env === 'dev') {
  app.proxy = true;

  const options = {
    key: config.hostingEnvironment.sslKey,
    cert: config.hostingEnvironment.sslCert,
    requestCert: false,
    rejectUnauthorized: false,
  };
  const server = https.createServer(options, app);

  server.listen(config.hostingEnvironment.port, () => {
    logger.info(`Dev server listening on https://${config.hostingEnvironment.host}:${config.hostingEnvironment.port} with config:\n${JSON.stringify(config)}`);
  });
} else if (config.hostingEnvironment.env === 'docker') {
  app.listen(config.hostingEnvironment.port, () => {
    logger.info(`Server listening on http://${config.hostingEnvironment.host}:${config.hostingEnvironment.port}`);
  });
} else {
  app.listen(process.env.PORT, () => {
    logger.info(`Server listening on http://${config.hostingEnvironment.host}:${config.hostingEnvironment.port}`);
  });
}
