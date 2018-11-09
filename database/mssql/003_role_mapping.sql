--------------------------------------------------------------------------------------------------
-- user_service_roles
--------------------------------------------------------------------------------------------------
IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'user_service_roles')
BEGIN
    CREATE TABLE user_service_roles (
      id uniqueidentifier NOT NULL,
      user_id uniqueidentifier NOT NULL,
      service_id uniqueidentifier NOT NULL,
      organisation_id uniqueidentifier NOT NULL,
      role_id uniqueidentifier NOT NULL,
      CreatedAt datetime2 NOT NULL,
      UpdatedAt datetime2 NOT NULL,

      CONSTRAINT [PK_UserServiceRoles] PRIMARY KEY(id),
      CONSTRAINT [FK_UserServiceRoles_Role] FOREIGN KEY (role_id) REFERENCES Role(Id)
    )
END

--------------------------------------------------------------------------------------------------
-- invitation_service_roles
--------------------------------------------------------------------------------------------------
IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'invitation_service_roles')
BEGIN
    CREATE TABLE invitation_service_roles (
      id uniqueidentifier NOT NULL,
      invitation_id uniqueidentifier NOT NULL,
      service_id uniqueidentifier NOT NULL,
      organisation_id uniqueidentifier NOT NULL,
      role_id uniqueidentifier NOT NULL,
      CreatedAt datetime2 NOT NULL,
      UpdatedAt datetime2 NOT NULL,

      CONSTRAINT [PK_InvitationServiceRoles] PRIMARY KEY(id),
      CONSTRAINT [FK_InvitationServiceRoles_Role] FOREIGN KEY (role_id) REFERENCES Role(Id)
    )
END