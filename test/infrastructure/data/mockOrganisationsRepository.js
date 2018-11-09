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
    invitationServices: mockTable(),
    invitationServiceIdentifiers: mockTable(),
    roles: mockTable(),
    policies: mockTable(),
    policyRoles: mockTable(),
    policyConditions: mockTable(),
    userServiceRoles: mockTable(),
    invitationServiceRoles: mockTable(),
    mockResetAll: function () {
      this.userServices.mockResetAll();
      this.userServiceIdentifiers.mockResetAll();
      this.invitationServices.mockResetAll();
      this.invitationServiceIdentifiers.mockResetAll();
      this.roles.mockResetAll();
      this.policies.mockResetAll();
      this.policyRoles.mockResetAll();
      this.policyConditions.mockResetAll();
      this.userServiceRoles.mockResetAll();
      this.invitationServiceRoles.mockResetAll();
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

const mockPolicyEntity = (data) => {
  const defaultEntity = {
    id: uuid(),
    name: uuid(),
    applicationId: uuid(),
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
    conditions: [],
  };
  const entity = Object.assign({}, defaultEntity, data);
  entity.mockResetAll = function () {
  };
  return entity;
};
const mockRoleEntity = (data) => {
  const defaultEntity = {
    id: uuid(),
    name: uuid(),
    applicationId: uuid(),
    status: 1,
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const entity = Object.assign({}, defaultEntity, data);
  entity.mockResetAll = function () {
  };
  return entity;
};
const mockPolicyConditionEntity = (data) => {
  const defaultEntity = {
    id: uuid(),
    policyId: uuid(),
    field: 'id',
    operator: 'Is',
    value: uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const entity = Object.assign({}, defaultEntity, data);
  entity.mockResetAll = function () {
  };
  return entity;
};

module.exports = {
  mockRepository,
  mockUserServiceEntity,
  mockPolicyEntity,
  mockRoleEntity,
  mockPolicyConditionEntity,
};
