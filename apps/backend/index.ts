import express, { type NextFunction, type Request, type Response }  from "express";
import { prisma, Prisma } from "db";
import { authSchema } from "./schema/authSchema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createMarketSchema } from "./schema/createMarketSchema";

const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation error", errors: parsed.error.issues });
    }

    const { username, password } = parsed.data;

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })
    
        return res.status(201).json({ id: user.id })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return res.status(409).json({ message: "User already exists" });
        }
        
        throw err;
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation error", errors: parsed.error.issues });
    }

    const { username, password } = parsed.data;

    const userExists = await prisma.user.findUnique({
        where: {
            username
        }
    });

    if (!userExists) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    const isCorrectPassword = await bcrypt.compare(password, userExists.password);
    if (!isCorrectPassword) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: userExists.id }, process.env.JWT_SECRET!)

    return res.json({ token });
})

app.post("/admin/market", async (req, res) => {
    const token = req.headers.token;
    if (token !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const parsed = createMarketSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Validation error", errors: parsed.error.issues });
    }

    const { slug, imageUrl } = parsed.data;

    const market = await prisma.market.create({
        data: {
            slug,
            imageUrl
        }
    });

    return res.status(201).json({ id: market.id });
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
})

app.listen(3000);