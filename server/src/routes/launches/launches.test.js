const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanets } = require("../../models/planets.model");

describe("Launches API", () => {
  beforeAll(async () => {
     await mongoConnect();
    await loadPlanets()
  });
  afterAll(async () => {
    return await mongoDisconnect();
  });
  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("content-type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchDate = {
      mission: "Yeu Chuc nhieu",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };

    const launchDateWithoutDate = {
      mission: "Yeu Chuc nhieu",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataInvalidDate = {
      mission: "Yeu Chuc nhieu",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "Zoot",
    };
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchDate)
        .expect("content-type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchDate.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject({
        mission: "Yeu Chuc nhieu",
        rocket: "NCC 1701-D",
        target: "Kepler-62 f",
      });
    });
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDateWithoutDate)
        .expect("content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataInvalidDate)
        .expect("content-type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
