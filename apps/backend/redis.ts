import { createClient } from "redis"

export const client = createClient({
  url: process.env.REDIS_URL
});

client.on("error", function(err) {
  throw err;
});

await client.connect()