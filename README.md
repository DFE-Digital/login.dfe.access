# DfE Sign-in API

[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest) [![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)

API for managing user permissions

## Testing

To run unit tests:

```bash
npm run test
```

Once the service is running, to test the API locally:

```bash
curl https://localhost:4440/users
```

When deployed to an environment, a bearer token is required. The token can be generated with https://github.com/DFE-Digital/login.dfe.jwt-strategies. Once you have the token you can append it to the curl command in the following way:

```bash
curl https://<host>/users --header 'Authorization: Bearer <bearer token here>'
```

## Prerequisite

---

1. Add audit sql host name to keyvault with name `auditSqlHostName` - added
2. Add audit sql db name to keyvault with name `auditSqlDbName` - added
3. Add Access host name to keyvault with name `standaloneAccessHostName` - added
4. Add app insights instrumentation Key to keyvault with name `appInsightsInstrumentationKey` - added
5. Add tenant Url to keyvault with name `tenantUrl` - added
6. Add aad shd app id to keyvault with name `aadshdappid` - added
7. Add platform Global Slack Feed in the keyvault with name `platformGlobalSlackFeed`
8. Add aad shd client id to keyvault with name `aadshdclientid` - added
9. Add aad shd client secret to keyvault with name `aadshdclientsecret` - added
