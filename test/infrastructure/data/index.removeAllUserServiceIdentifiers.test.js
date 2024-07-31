const { removeAllUserServiceIdentifiers } = require('./../../../src/infrastructure/data');
const sequelize = require('./__mocks__/sequelizeMock');
const { userServiceIdentifiers } = require('./__mocks__/sequelizeMock');

jest.mock('sequelize');

describe('When removing all service identifiers for a given user, service and organisation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove all user service roles with a new transaction', async () => {
    const uid = '123';
    const sid = '456';
    const oid = '789';

    await removeAllUserServiceIdentifiers(uid, sid, oid);

    expect(sequelize.transaction).toHaveBeenCalledTimes(1);
    expect(userServiceIdentifiers.destroy).toHaveBeenCalledWith(
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

    await removeAllUserServiceIdentifiers(uid, sid, oid, existingTransaction);

    expect(sequelize.transaction).not.toHaveBeenCalled();
    expect(userServiceIdentifiers.destroy).toHaveBeenCalledWith(
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

    userServiceIdentifiers.destroy.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    const transaction = await sequelize.transaction();

    await expect(removeAllUserServiceIdentifiers(uid, sid, oid, transaction)).rejects.toThrow('Test error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});



// jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
// jest.mock('uuid');

// const uuid = require('uuid');
// const repository = require('./../../../src/infrastructure/data/organisationsRepository');
// const { removeAllUserServiceIdentifiers } = require('./../../../src/infrastructure/data');
// const { Op } = require('sequelize');

// const uid = 'user-1';
// const sid = 'service-1';
// const oid = 'organisation-1';

// describe('When adding an identifier to a user service in repository', () => {
//   beforeEach(() => {
//     repository.mockResetAll();

//     uuid.v4.mockReset().mockReturnValue('new-uuid');
//   });

//   it('then it should upsert the record', async () => {
//     await removeAllUserServiceIdentifiers(uid, sid, oid);

//     expect(repository.userServiceIdentifiers.destroy).toHaveBeenCalledTimes(1);
//     expect(repository.userServiceIdentifiers.destroy.mock.calls[0][0]).toMatchObject({
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



// // import necessary libraries and modules
// const { Op } = require('sequelize');
// const SequelizeMock = require('sequelize-mock');
// const { removeAllUserServiceIdentifiers } = require('./../../../src/infrastructure/data');
// const { userServiceIdentifiers } = require('./../../../src/infrastructure/data/organisationsRepository');

// jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());
// jest.mock('uuid');

// //jest.mock('./../../../src/infrastructure/data/organisationsRepository');
// // const repository = require('./../../../src/infrastructure/data/organisationsRepository');

// // Mock the Sequelize connection and transaction
// const DBConnectionMock = new SequelizeMock();
// const userServiceIdentifiersMock = DBConnectionMock.define('userServiceIdentifiers', {});

// // Mock the transaction
// const transactionMock = DBConnectionMock.transaction();

// // Mock the removeAllUserServiceIdentifiers function
// jest.mock('./../../../src/infrastructure/data', () => ({
//   removeAllUserServiceIdentifiers: jest.fn()
// }));

// describe('When removing user service identifiers', () => {
//   const uid = 1;
//   const sid = 2;
//   const oid = 3;

//   beforeAll(() => {
//     // Override the original model with the mock
//     userServiceIdentifiers.destroy = userServiceIdentifiersMock.destroy;
//   });

//   it('should delete userServiceIdentifiers with the specified ids', async () => {
//     // Mock the destroy method
//     const destroySpy = jest.spyOn(userServiceIdentifiersMock, 'destroy').mockResolvedValueOnce(1); // Assuming 1 row affected

//     // Call the function
//     await removeAllUserServiceIdentifiers(uid, sid, oid, transactionMock);

//     // Check if the destroy method was called with the correct parameters
//     expect(destroySpy).toHaveBeenCalledWith({
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
//     }, { transaction: transactionMock });

//     // Clean up
//     destroySpy.mockRestore();
//   });

//   it('should create a new transaction if none is provided', async () => {
//     const newTransactionMock = DBConnectionMock.transaction();
//     jest.spyOn(DBConnectionMock, 'transaction').mockResolvedValueOnce(newTransactionMock);
//     const destroySpy = jest.spyOn(userServiceIdentifiersMock, 'destroy').mockResolvedValueOnce(1);

//     // Call the function without passing a transaction
//     await removeAllUserServiceIdentifiers(uid, sid, oid);

//     // Check if a new transaction was created
//     expect(DBConnectionMock.transaction).toHaveBeenCalled();

//     // Clean up
//     destroySpy.mockRestore();
//   });
// });
