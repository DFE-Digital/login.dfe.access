const SequelizeMock = require('sequelize-mock');
const dbMock = new SequelizeMock();

const transactionMock = {
  commit: jest.fn(),
  rollback: jest.fn(),
};

const userServiceRequests = dbMock.define('userServiceRequests', {
    user_id: '123',
    service_id: '456',
    organisation_id: '789',
  });

const userServiceRoles = dbMock.define('userServiceRoles', {
    user_id: '123',
    service_id: '456',
    organisation_id: '789',
  });

const userServiceIdentifiers = dbMock.define('userServiceIdentifiers', {
    user_id: '123',
    service_id: '456',
    organisation_id: '789',
  });

const userServices = dbMock.define('userServices', {
  user_id: '123',
  service_id: '456',
  organisation_id: '789',
});

module.exports = {
  transaction: jest.fn(() => transactionMock),
  userServiceRequests,
  userServiceRoles,
  userServiceIdentifiers,
  userServices,
};
