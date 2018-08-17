const uuid = require('uuid/v4');

const mockTable = () => {
  return {
    findAll: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };
};
const mockRepository = () => {
  return {
    userServices: mockTable(),
    mockResetAll: function () {
      this.userServices.findAll.mockReset().mockReturnValue([]);
      this.userServices.find.mockReset();
      this.userServices.create.mockReset();
    },
  };
};

const mockUserServiceEntity = (data, identifiers = undefined) => {
  const defaultEntity = {
    service_id: uuid(),
    organisation_id: uuid(),
    createdAt: new Date(),
    getIdentifiers: jest.fn().mockReturnValue(identifiers),
  };
  const entity = Object.assign({}, defaultEntity, data);
  entity.mockResetAll = function () {
    this.getIdentifiers.mockReset().mockReturnValue(identifiers);
  };
  return entity;
};

module.exports = {
  mockRepository,
  mockUserServiceEntity,
};
