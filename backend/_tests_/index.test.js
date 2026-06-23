const request = require('supertest');
const { app } = require('../index'); // Assure-toi que ton fichier server.js exporte bien 'app'

describe("Express App Tests", () => {
  it("should return 200 OK on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200); // Corrigé ici ;
    expect(res.text).toBe("serveur is running");
  });
});