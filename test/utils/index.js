const mockLogger = () => {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    mockResetAll: function () {
      this.info.mockReset();
      this.warn.mockReset();
      this.error.mockReset();
    },
  };
};

const mockConfig = (customConfig) => {
  return Object.assign({
  }, customConfig);
};

const mockRequest = (customRequest) => {
  return Object.assign({
    params: {},
    query: {},
    body: {},
    correlationId: 'some-correlation-id',
  }, customRequest);
};

const mockResponse = (customResponse) => {
  const res = Object.assign({
    status: jest.fn(),
    send: jest.fn(),
    contentType: jest.fn(),
    json: jest.fn(),
    set: jest.fn(),
    mockResetAll: function() {
      this.status.mockReset().mockReturnValue(this);
      this.send.mockReset().mockReturnValue(this);
      this.contentType.mockReset().mockReturnValue(this);
      this.json.mockReset().mockReturnValue(this);
      this.set.mockReset().mockReturnValue(this);
    }
  }, customResponse);
  res.mockResetAll();
  return res;
};

module.exports = {
  mockLogger,
  mockConfig,
  mockRequest,
  mockResponse,
};
