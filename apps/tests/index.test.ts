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
  let MARKET_ID: string;
  let user1Token: string;
  let user2Token: string;

  beforeAll(async () => {
    const marketResponse = await axios.post(`${BACKEND_URL}/admin/market`, {
      slug: "SOL",
      imageUrl: "sol.png"
    }, {
      headers: {
        token: "perps-admin-secret"
      }
    });

    MARKET_ID = marketResponse.data.id;

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
      username: USER2,
      password: PASSWORD
    });
    user1Token = response1.data.token;
    user2Token = response2.data.token;

    await axios.post(`${BACKEND_URL}/api/v1/onramp`, {
      amount: 10000
    }, {
      headers: {
        Authorization: `Bearer ${user1Token}`
      }
    })

    await axios.post(`${BACKEND_URL}/api/v1/onramp`, {
      amount: 10000
    }, {
      headers: {
        Authorization: `Bearer ${user2Token}`
      }
    })
  })

  it("First order should sit on the book with 0 filled qty", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/order`, {
      price: 100,
      qty: 10,
      side: "LONG",
      marketId: MARKET_ID,
      type: "LIMIT"
    }, {
      headers: {
        Authorization: `Bearer ${user1Token}`
      }
    })

    expect(response.status).toBe(200);
    expect(response.data.filledQty).toBe(0);
    expect(response.data.orderId).toBeDefined();
  })

  it("Second order should sit on the book if not matched", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/order`, {
      price: 102,
      qty: 10,
      side: "SHORT",
      marketId: MARKET_ID,
      type: "LIMIT"
    }, {
      headers: {
        Authorization: `Bearer ${user2Token}`
      }
    })

    expect(response.status).toBe(200);
    expect(response.data.filledQty).toBe(0);
    expect(response.data.orderId).toBeDefined();
  })

  it("Third order should match", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/order`, {
      price: 100,
      qty: 20,
      side: "SHORT",
      marketId: MARKET_ID,
      type: "LIMIT"
    }, {
      headers: {
        Authorization: `Bearer ${user2Token}`
      }
    })

    expect(response.status).toBe(200);
    expect(response.data.filledQty).toBe(10);
    expect(response.data.orderId).toBeDefined();
  })
})
