import { createConnection } from "typeorm";
import * as request from "supertest";
import app from "../../src/app";
import { port } from "../../src/config";

let connection, server;

const testUser = {
  firstName: "Cristiano",
  lastName: "Ferreira",
  age: 20,
};

beforeEach(async () => {
  connection = await createConnection();
  await connection.synchronize(true);
  server = app.listen(port);
});

afterEach(() => {
  connection.close();
  server.close();
});

describe("não deve haver usuários inicialmente", () => {
  it("should be no users initially", async () => {
    const response = await request(app).get("/users");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("deve criar um usuário", () => {
  it("should create a user", async () => {
    const response = await request(app).post("/users").send(testUser);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ ...testUser, id: 1 });
  });
});

describe("não deve criar um usuário se nenhum firstName for fornecido", () => {
  it("should not create a user if no firstName is given", async () => {
    const response = await request(app)
      .post("/users")
      .send({ lastName: "Ferreira", age: 21 });
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0]).toEqual({
      msg: "Invalid value",
      param: "firstName",
      location: "body",
    });
  });
});

describe("não deve criar um usuário se a idade for menor que 0", () => {
  it("should not create a user if age is less than 0", async () => {
    const response = await request(app)
      .post("/users")
      .send({ firstName: "Cristiano", lastName: "Ferreira", age: -1 });
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).not.toBeNull();
    expect(response.body.errors.length).toBe(1);
    expect(response.body.errors[0]).toEqual({
      msg: "age must be a positive integer",
      param: "age",
      value: -1,
      location: "body",
    });
  });
});
