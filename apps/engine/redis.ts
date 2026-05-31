import { createClient } from "redis"

export const client = createClient({
  url: process.env.REDIS_URL
});

client.on("error", function(err) {
  throw err;
});

await client.connect()

export const publisher = createClient({
    url: process.env.REDIS_URL
  });
  
  publisher.on("error", function(err) {
    throw err;
  });
  
  await publisher.connect()