import axios, { AxiosError } from "axios";
import { beforeAll, describe, expect, it } from "bun:test";
import { BACKEND_URL } from "./config";

describe("auth endpoints", () => {
  const username = `lohith-${Date.now()}`;
  it("signup doesn't work if username isn't provided", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        password: "123123",
      });
      throw new Error("Expected signup to fail");
    } catch (e) {
      if (e instanceof AxiosError) {
        expect(e.response?.status).toBe(400);
      } else {
        throw e;
      }
    }
  });

  it("Signup does work", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password: "123123",
    });
    expect(response.data.id).toBeDefined();
  });

  it("signup doesn't work if username already exists", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password: "123123",
      });

      throw new Error("Expected signup to fail");
    } catch (e) {
      if (e instanceof AxiosError) {
        expect(e.response?.status).toBe(409);
      } else {
        throw e;
      }
    }
  });

  it("signin doesn't work if username isn't provided", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        password: "123123",
      });
      throw new Error("Expected signin to fail");
    } catch (e) {
      if (e instanceof AxiosError) {
        expect(e.response?.status).toBe(400);
      } else {
        throw e;
      }
    }
  });

  it("signin doesn't work if wrong credentials", async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password: "wrong-password",
      });
      throw new Error("Expected signin to fail");
    } catch (e) {
      if (e instanceof AxiosError) {
        expect(e.response?.status).toBe(403);
      } else {
        throw e;
      }
    }
  });

  it("signin does work", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password: "123123",
    });
    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });
});

describe("Order endpoints", () => {
  const USER1 = `lohith-${Date.now()}`;
  const USER2 = `lohith-${Date.now()}`;
  const PASSWORD = "123123123";
  let user1Token;
  let user2Token;

  beforeAll(async () => {
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: USER1,
      password: PASSWORD
    });
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: USER2,
      password: PASSWORD
    });

    const response1 = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: USER1,
      password: PASSWORD
    });
    const response2 = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: USER1,
      password: PASSWORD
    });
    user1Token = response1.data.token;
    user2Token = response2.data.token;
  })

  it("First order should sit on the book with 0 filled qty", () => {
    
  })
})
