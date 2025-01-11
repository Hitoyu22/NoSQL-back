import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Middleware pour vérifier si l'utilisateur est authentifié

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Accès refusé. Token manquant." });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.body.userId = (decoded as any).userId;
        next();
    } catch (error) {
        res.status(400).json({ message: "Token invalide." });
    }
};
