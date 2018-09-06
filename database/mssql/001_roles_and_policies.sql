--------------------------------------------------------------------------------------------------
-- Role
--------------------------------------------------------------------------------------------------
IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'Role')
BEGIN
    CREATE TABLE Role (
      Id uniqueidentifier NOT NULL,
      Name nvarchar(125) NOT NULL,
      ApplicationId uniqueidentifier NOT NULL,
      Status smallint NOT NULL CONSTRAINT [DF_Role_Status] DEFAULT(1),
      CreatedAt datetime2 NOT NULL,
      UpdatedAt datetime2 NOT NULL,

      CONSTRAINT [PK_Role] PRIMARY KEY(id)
    )

    CREATE INDEX [IX_Role_ApplicationId] ON Role(ApplicationId)
END

--------------------------------------------------------------------------------------------------
-- Policy
--------------------------------------------------------------------------------------------------
IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'Policy')
BEGIN
    CREATE TABLE Policy (
      Id uniqueidentifier NOT NULL,
      Name nvarchar(125) NOT NULL,
      ApplicationId uniqueidentifier NOT NULL,
      Status smallint NOT NULL CONSTRAINT [DF_Policy_Status] DEFAULT(1),
      CreatedAt datetime2 NOT NULL,
      UpdatedAt datetime2 NOT NULL,

      CONSTRAINT [PK_Policy] PRIMARY KEY(id)
    )

    CREATE INDEX [IX_Policy_ApplicationId] ON Policy(ApplicationId)
END

--------------------------------------------------------------------------------------------------
-- PolicyRole
--------------------------------------------------------------------------------------------------
IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'PolicyRole')
BEGIN
    CREATE TABLE PolicyRole (
      PolicyId uniqueidentifier NOT NULL,
      RoleId uniqueidentifier NOT NULL,
      CreatedAt datetime2 NOT NULL,
      UpdatedAt datetime2 NOT NULL,

      CONSTRAINT [PK_PolicyRole] PRIMARY KEY (PolicyId, RoleId),
      CONSTRAINT [FK_PolicyRole_Policy] FOREIGN KEY (PolicyId) REFERENCES Policy(Id),
      CONSTRAINT [FK_PolicyRole_Role] FOREIGN KEY (RoleId) REFERENCES Role(Id)
    )
END

--------------------------------------------------------------------------------------------------
-- PolicyCondition
--------------------------------------------------------------------------------------------------
IF NOT EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.TABLES where TABLE_NAME = 'PolicyCondition')
BEGIN
    CREATE TABLE PolicyCondition (
      Id uniqueidentifier NOT NULL,
      PolicyId uniqueidentifier NOT NULL,
      Field varchar(255) NOT NULL,
      Operator varchar(25) NOT NULL,
      Value nvarchar(max) NOT NULL,
      CreatedAt datetime2 NOT NULL,
      UpdatedAt datetime2 NOT NULL,

      CONSTRAINT [PK_PolicyCondition] PRIMARY KEY(Id),
      CONSTRAINT [FK_PK_PolicyCondition_Policy] FOREIGN KEY (PolicyId) REFERENCES Policy(Id)
    )
END