const { removeAllUserServiceRequests } = require('./../../../src/infrastructure/data');
const sequelize = require('./__mocks__/sequelizeMock');
const { userServiceRequests } = require('./__mocks__/sequelizeMock');

jest.mock('sequelize');

describe('When removing all service requets for a given user, service and organisation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove all user service requests with a new transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';

    await removeAllUserServiceRequests(uid, sid, oid);

    expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    expect(userServiceRequests.destroy).toHaveBeenCalledWith(
      {
        where: {
          user_id: uid,
          service_id: sid,
          organisation_id: oid,
        },
      },
      { transaction: expect.any(Object) }
    );
  });

  it('should remove all user service requests with an existing transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';
    const existingTransaction = { commit: jest.fn(), rollback: jest.fn() };

    await removeAllUserServiceRequests(uid, sid, oid, existingTransaction);

    expect(sequelize.transaction).not.toHaveBeenCalled();
    expect(userServiceRequests.destroy).toHaveBeenCalledWith(
      {
        where: {
          user_id: uid,
          service_id: sid,
          organisation_id: oid,
        },
      },
      { transaction: existingTransaction }
    );
  });

  it('should handle errors and rollback the transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';

    userServiceRequests.destroy.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const transaction = await sequelize.transaction();

    await expect(removeAllUserServiceRequests(uid, sid, oid, transaction)).rejects.toThrow('Test error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});



// jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
// jest.mock('uuid');

// const uuid = require('uuid');
// const repository = require('./../../../src/infrastructure/data/organisationsRepository');
// const { removeAllUserServiceRequests } = require('./../../../src/infrastructure/data');
// const { Op } = require('sequelize');

// const uid = 'user-1';
// const sid = 'service-1';
// const oid = 'organisation-1';

// describe('When removing service requests from a user for a given service in the repository', () => {
//   beforeEach(() => {
//     repository.mockResetAll();

//     uuid.v4.mockReset().mockReturnValue('new-uuid');
//   });

//   it('then it should destroy all records for user/service/org', async () => {
//     await removeAllUserServiceRequests(uid, sid, oid);

//     expect(repository.userServiceRequests.destroy).toHaveBeenCalledTimes(1);
//     expect(repository.userServiceRequests.destroy.mock.calls[0][0]).toMatchObject({
//       where: {
//         user_id: {
//           [Op.eq]: uid,
//         },
//         service_id: {
//           [Op.eq]: sid,
//         },
//         organisation_id: {
//           [Op.eq]: oid,
//         },
//       },
//     });
//   });
// });