const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const axios = require("axios");

jest.mock("axios");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API", () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it("POST /api/v1/auth/register should create a new user and send OTP", async () => {
    axios.get.mockResolvedValue({
      data: {
        acknowledge: "success",
        response: {
          status: "Send in progress",
          message_id: "a3ddc51c-7ffe-4eaf-8ee1-a0c6628aaa2c",
          message: "OTP sent successfully, it is 12345",
          to: "+251937881256",
          verificationId: "30748c9f-487c-4c82-a48b-4080ec00996c",
        },
      },
    });

    const res = await request(app).post("/api/delivery/auth/register").send({
      email: "test@example.com",
      phone: "+251937881256",
      password: "password123",
      role: "customer",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.userId).toBeDefined();
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.afromessage.com/api/challenge",
      expect.objectContaining({
        to: "+251937881256",
        len: 6,
        t: 0,
        ttl: 300,
      })
    );
  });

  it("POST /api/v1/auth/verify-otp should verify OTP", async () => {
    const user = await new User({
      email: "verify@example.com",
      phone: "+251937881256",
      password: await bcrypt.hash("password123", 10),
      role: "customer",
      isVerified: false,
    }).save();

    await redisClient.setEx(
      `otp:+251937881256`,
      300,
      JSON.stringify({
        code: "123456",
        verificationId: "30748c9f-487c-4c82-a48b-4080ec00996c",
      })
    );

    const res = await request(app).post("/api/delivery/auth/verify-otp").send({
      phone: "+251937881256",
      otp: "123456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.userId).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /api/v1/auth/login should authenticate user", async () => {
    await new User({
      email: "login@example.com",
      phone: "+251937881256",
      password: await bcrypt.hash("password123", 10),
      role: "customer",
      isVerified: true,
    }).save();

    const res = await request(app).post("/api/delivery/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.userId).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /api/v1/auth/login should request OTP for unverified user", async () => {
    axios.get.mockResolvedValue({
      data: {
        acknowledge: "success",
        response: {
          status: "Send in progress",
          message_id: "a3ddc51c-7ffe-4eaf-8ee1-a0c6628aaa2c",
          message: "OTP sent successfully, it is 12345",
          to: "+251937881256",
          verificationId: "30748c9f-487c-4c82-a48b-4080ec00996c",
        },
      },
    });

    await new User({
      email: "unverified@example.com",
      phone: "+251937881256",
      password: await bcrypt.hash("password123", 10),
      role: "customer",
      isVerified: false,
    }).save();

    const res = await request(app).post("/api/delivery/auth/login").send({
      email: "unverified@example.com",
      phone: "+251937881256",
      password: "password123",
    });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "User not verified, please verify your phone number"
    );
    expect(axios.get).toHaveBeenCalledWith();
  });
});
