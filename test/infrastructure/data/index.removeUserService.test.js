const { removeUserService } = require('./../../../src/infrastructure/data');
const sequelize = require('./__mocks__/sequelizeMock');
const { userServices } = require('./__mocks__/sequelizeMock');

jest.mock('sequelize');

describe('removeUserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove the user service with a new transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';

    await removeUserService(uid, sid, oid);

    expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    expect(userServices.destroy).toHaveBeenCalledWith(
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

  it('should remove the user service with an existing transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';
    const existingTransaction = { commit: jest.fn(), rollback: jest.fn() };

    await removeUserService(uid, sid, oid, existingTransaction);

    expect(sequelize.transaction).not.toHaveBeenCalled();
    expect(userServices.destroy).toHaveBeenCalledWith(
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

    userServices.destroy.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const transaction = await sequelize.transaction();

    await expect(removeUserService(uid, sid, oid, transaction)).rejects.toThrow('Test error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});



// jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
// jest.mock('uuid');

// const uuid = require('uuid');
// const repository = require('./../../../src/infrastructure/data/organisationsRepository');
// const { removeUserService } = require('./../../../src/infrastructure/data');
// const { Op } = require('sequelize');

// const uid = 'user-1';
// const sid = 'service-1';
// const oid = 'organisation-1';

// describe('When removing a user service in repository', () => {
//   beforeEach(() => {
//     repository.mockResetAll();

//     uuid.v4.mockReset().mockReturnValue('new-uuid');
//   });

//   it('then it should upsert the record', async () => {
//     await removeUserService(uid, sid, oid);

//     expect(repository.userServices.destroy).toHaveBeenCalledTimes(1);
//     expect(repository.userServices.destroy.mock.calls[0][0]).toMatchObject({
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