import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            message: "Authorization header missing"
        });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Token missing"
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        req.userId = payload.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}