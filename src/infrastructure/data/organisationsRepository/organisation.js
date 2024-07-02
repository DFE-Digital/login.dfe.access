const Sequelize = require('sequelize').default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  return db.define('organisation', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    LegalName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    Category: {
      type: Sequelize.STRING,
      allowNull: true
    },
    Type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    URN: {
      type: Sequelize.STRING,
      allowNull: true
    },
    UID: {
      type: Sequelize.STRING,
      allowNull: true
    },
    UKPRN: {
      type: Sequelize.STRING,
      allowNull: true
    },
    EstablishmentNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    Status: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    ClosedOn: {
      type: Sequelize.DATE,
      allowNull: true
    },
    Address: {
      type: Sequelize.STRING,
      allowNull: true
    },
    phaseOfEducation: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    statutoryLowAge: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    statutoryHighAge: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    telephone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    regionCode: {
      type: Sequelize.STRING,
      allowNull: true
    },
    legacyId: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    companyRegistrationNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    DistrictAdministrativeName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    DistrictAdministrativeCode: {
      type: Sequelize.STRING,
      allowNull: true
    },
    DistrictAdministrative_code: {
      type: Sequelize.STRING,
      allowNull: true
    },
    ProviderProfileID: {
      type: Sequelize.STRING,
      allowNull: true
    },
    UPIN: {
      type: Sequelize.STRING,
      allowNull: true
    },
    ProviderTypeName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    ProviderTypeCode: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    SourceSystem: {
      type: Sequelize.STRING,
      allowNull: true
    },
    GIASProviderType: {
      type: Sequelize.STRING,
      allowNull: true
    },
    PIMSProviderType: {
      type: Sequelize.STRING,
      allowNull: true
    },
    PIMSProviderTypeCode: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    PIMSStatus: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    masteringCode: {
      type: Sequelize.STRING,
      allowNull: true
    },
    OpenedOn: {
      type: Sequelize.STRING,
      allowNull: true
    },
    PIMSStatusName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    GIASStatus: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    GIASStatusName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    MasterProviderStatusCode: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    MasterProviderStatusName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    IsOnAPAR: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'organisation',
    schema
  });
};

const extend = ({  }) => {
  
};

module.exports = {
  name: 'organisations',
  define,
  extend
};
