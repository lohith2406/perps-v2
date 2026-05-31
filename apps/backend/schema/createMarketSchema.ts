import z from "zod";

export const createMarketSchema = z.object({
    slug: z.string(),
    imageUrl: z.url()
})