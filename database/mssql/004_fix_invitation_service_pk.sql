DECLARE @s004_constraint_name varchar(50) =
  (SELECT CONSTRAINT_NAME
   FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
   WHERE TABLE_NAME = 'invitation_services'
   AND CONSTRAINT_TYPE='PRIMARY KEY')

IF((SELECT COUNT(1)
FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE
WHERE COLUMN_NAME IN ('invitation_id', 'organisation_id', 'service_id')
AND CONSTRAINT_NAME = @s004_constraint_name) <> 3)
    BEGIN
      EXEC('ALTER TABLE invitation_services
        DROP CONSTRAINT ' + @s004_constraint_name)

      ALTER TABLE invitation_services
        ADD CONSTRAINT PK_InvitationServices PRIMARY KEY (invitation_id, organisation_id, service_id)
    END