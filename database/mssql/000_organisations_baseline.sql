IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'invitation_services')
BEGIN
    CREATE TABLE dbo.invitation_services
    (
        invitation_id uniqueidentifier PRIMARY KEY NOT NULL,
        role_id smallint DEFAULT 0 NOT NULL,
        organisation_id uniqueidentifier NOT NULL,
        service_id uniqueidentifier NOT NULL,
        CONSTRAINT invitation_services_organisation_id_fk FOREIGN KEY (organisation_id) REFERENCES organisation (id),
        CONSTRAINT invitation_services_service_id_fk FOREIGN KEY (service_id) REFERENCES service (id)
    );
END
GO

IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'user_services')
BEGIN
    CREATE TABLE dbo.user_services
    (
        id uniqueidentifier PRIMARY KEY NOT NULL,
        status smallint DEFAULT 0 NOT NULL,
        user_id uniqueidentifier NOT NULL,
        role_id smallint DEFAULT 0 NOT NULL,
        organisation_id uniqueidentifier,
        service_id uniqueidentifier,
        createdAt datetime2 NOT NULL,
        updatedAt datetime2 NOT NULL,
        CONSTRAINT user_services_organisation_id_fk FOREIGN KEY (organisation_id) REFERENCES organisation (id),
        CONSTRAINT user_services_service_id_fk FOREIGN KEY (service_id) REFERENCES service (id)
    );

    CREATE NONCLUSTERED INDEX [IX_UserServices_UserOrg] ON [user_services] ([user_id], [organisation_id]);
END
GO

IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'user_service_identifiers')
BEGIN
    create table dbo.user_service_identifiers
    (
        user_id uniqueidentifier not null,
        service_id uniqueidentifier not null,
        organisation_id uniqueidentifier not null,
        identifier_key varchar(25) not null,
        identifier_value varchar(max) not null,
        constraint user_service_identifiers_pkey
            primary key (user_id, service_id, organisation_id, identifier_key)
    )
END
GO

IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'invitation_service_identifiers')
BEGIN
    create table dbo.invitation_service_identifiers
    (
        invitation_id uniqueidentifier not null,
        service_id uniqueidentifier not null,
        organisation_id uniqueidentifier not null,
        identifier_key varchar(25) not null,
        identifier_value varchar(max) not null,
        constraint invitation_service_identifiers_pkey
            primary key (invitation_id, service_id, organisation_id, identifier_key)
    )
END
GO