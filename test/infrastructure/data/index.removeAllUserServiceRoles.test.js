const { removeAllUserServiceRoles } = require('./../../../src/infrastructure/data');
const sequelize = require('./__mocks__/sequelize');
const { userServiceRoles } = require('./__mocks__/sequelize');

jest.mock('sequelize');

describe('When removing all service roles for a given user, service and organisation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove all user service roles with a new transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';

    await removeAllUserServiceRoles(uid, sid, oid);

    expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    expect(userServiceRoles.destroy).toHaveBeenCalledWith(
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

  it('should remove all user service roles with an existing transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';
    const existingTransaction = { commit: jest.fn(), rollback: jest.fn() };

    await removeAllUserServiceRoles(uid, sid, oid, existingTransaction);

    expect(sequelize.transaction).not.toHaveBeenCalled();
    expect(userServiceRoles.destroy).toHaveBeenCalledWith(
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

    userServiceRoles.destroy.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const transaction = await sequelize.transaction();

    await expect(removeAllUserServiceRoles(uid, sid, oid, transaction)).rejects.toThrow('Test error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});



// jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
// jest.mock('uuid');

// const uuid = require('uuid');
// const repository = require('./../../../src/infrastructure/data/organisationsRepository');
// const { removeAllUserServiceRoles } = require('./../../../src/infrastructure/data');
// const { Op } = require('sequelize');

// const uid = 'user-1';
// const sid = 'service-1';
// const oid = 'organisation-1';

// describe('When removing roles from a user service in repository', () => {
//   beforeEach(() => {
//     repository.mockResetAll();

//     uuid.v4.mockReset().mockReturnValue('new-uuid');
//   });

//   it('then it should destroy all records for user/service/org', async () => {
//     await removeAllUserServiceRoles(uid, sid, oid);

//     expect(repository.userServiceRoles.destroy).toHaveBeenCalledTimes(1);
//     expect(repository.userServiceRoles.destroy.mock.calls[0][0]).toMatchObject({
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