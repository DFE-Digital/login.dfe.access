const sequelize = require('sequelize');
const logger = require('./../../../src/infrastructure/logger');
const { removeUserServiceAndAssociations } = require('./../../../src/infrastructure/data');
const { userServiceRequests, userServiceRoles, userServiceIdentifiers, userServices } = require('./../../../src/infrastructure/data/organisationsRepository');

jest.mock('sequelize');
jest,mock('./../../../src/infrastructure/logger');
jest.mock('./../../../src/infrastructure/data/organisationsRepository');

describe('removeUserServiceAndAssociations', () => {
  const uid = 1;
  const sid = 2;
  const oid = 3;

  let transaction;
  let mockDestroy;

  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };

    sequelize.transaction = jest.fn((fn) => fn(transaction));
    mockDestroy = jest.fn();
    userServiceRequests.destroy = mockDestroy;
    userServiceRoles.destroy = mockDestroy;
    userServiceIdentifiers.destroy = mockDestroy;
    userServices.destroy = mockDestroy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should remove user service and associations successfully', async () => {
    await removeUserServiceAndAssociations(uid, sid, oid);

    expect(sequelize.transaction).toHaveBeenCalled();
    expect(userServiceRequests.destroy).toHaveBeenCalledWith({
      where: {
        user_id: uid,
        service_id: sid,
        organisation_id: oid,
      },
    }, { transaction });

    expect(userServiceRoles.destroy).toHaveBeenCalledWith({
      where: {
        user_id: uid,
        service_id: sid,
        organisation_id: oid,
      },
    }, { transaction });

    expect(userServiceIdentifiers.destroy).toHaveBeenCalledWith({
      where: {
        user_id: uid,
        service_id: sid,
        organisation_id: oid,
      },
    }, { transaction });

    expect(userServices.destroy).toHaveBeenCalledWith({
      where: {
        user_id: uid,
        service_id: sid,
        organisation_id: oid,
      },
    }, { transaction });

    expect(transaction.commit).toHaveBeenCalled();
  });

  it('should rollback transaction if an error occurs', async () => {
    userServiceRequests.destroy.mockRejectedValueOnce(new Error('Test error'));

    await expect(removeUserServiceAndAssociations(uid, sid, oid)).rejects.toThrow('Test error');

    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('should log error if an exception is thrown', async () => {
    const logger = require('./logger'); // replace with the actual path to your logger
    jest.spyOn(logger, 'error').mockImplementation(() => {});

    userServiceRequests.destroy.mockRejectedValueOnce(new Error('Test error'));

    await expect(removeUserServiceAndAssociations(uid, sid, oid)).rejects.toThrow('Test error');

    expect(logger.error).toHaveBeenCalledWith(
      `Error removing service: ${sid} with org: ${oid} from user: ${uid} - Test error`,
      expect.objectContaining({
        stack: expect.any(String)
      })
    );
  });
});