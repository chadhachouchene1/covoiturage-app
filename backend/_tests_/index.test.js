// Mock AWS avant tout require !
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock('multer-s3', () => () => ({
  _handleFile: jest.fn(),
  _removeFile: jest.fn(),
}));

const request = require('supertest');
const { app } = require('../index');

describe("Express App Tests", () => {
  it("should return 200 OK on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("serveur is running");
  });
});