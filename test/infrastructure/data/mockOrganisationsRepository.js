const uuid = require('uuid/v4');

const mockTable = () => {
  return {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    destroy: jest.fn(),
    mockResetAll: function () {
      this.findAll.mockReset().mockReturnValue([]);
      this.findAndCountAll.mockReset().mockReturnValue([]);
      this.find.mockReset();
      this.create.mockReset();
      this.upsert.mockReset();
      this.destroy.mockReset();
    },
  };
};
const mockRepository = () => {
  return {
    userServices: mockTable(),
    userServiceIdentifiers: mockTable(),
    mockResetAll: function () {
      this.userServices.mockResetAll();
      this.userServiceIdentifiers.mockResetAll();
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
