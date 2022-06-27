jest.mock('./../../../src/infrastructure/data/organisationsRepository', () => require('./mockOrganisationsRepository').mockRepository());

const { mockUserServiceEntity } = require('./mockOrganisationsRepository');
const repository = require('./../../../src/infrastructure/data/organisationsRepository');
const { getUserService } = require('./../../../src/infrastructure/data');
const { Op } = require('sequelize');

const uid = 'user-1';
const sid = 'service-1';
const oid = 'organisation-1';
const service = mockUserServiceEntity({}, [
  { identifier_key: 'k2s-id', identifier_value: '123456' },
  { identifier_key: 'groups', identifier_value: 'g1,g2' },
], [
  { role: { id: 'role1', code: 'R1', name: 'Role One', status: 1 } },
  { role: { id: 'role2', code: 'R2', name: 'Role Two', status: 0 } },
]);

describe('When getting user service from the repository', () => {
  beforeEach(() => {
    repository.mockResetAll();

    repository.userServices.findOne.mockReturnValue(service);

    service.mockResetAll();
  });

  it('then it should find for user_id, service_id, organisation_id', async () => {
    await getUserService(uid, sid, oid);

    expect(repository.userServices.findOne).toHaveBeenCalledTimes(1);
    expect(repository.userServices.findOne.mock.calls[0][0]).toMatchObject({
      where: {
        user_id: {
          [Op.eq]: uid,
        },
        service_id: {
          [Op.eq]: sid,
        },
        organisation_id: {
          [Op.eq]: oid,
        },
      },
    });
  });

  it('then it should return services mapped to model', async () => {
    const actual = await getUserService(uid, sid, oid);

    expect(actual).toEqual({
      serviceId: service.service_id,
      organisationId: service.organisation_id,
      roles: [
        {
          id: 'role1',
          code: 'R1',
          name: 'Role One',
          status: {
            id: 1
          }
        },
        {
          id: 'role2',
          code: 'R2',
          name: 'Role Two',
          status: {
            id: 0
          }
        },
      ],
      identifiers: [
        { key: 'k2s-id', value: '123456' },
        { key: 'groups', value: 'g1,g2' },
      ],
      accessGrantedOn: service.createdAt,
    });
  });

  it('then it should return undefined if no record found', async () => {
    repository.userServices.findOne.mockReturnValue(undefined);

    const actual = await getUserService(uid, sid, oid);

    expect(actual).toBeUndefined();
  })
});
