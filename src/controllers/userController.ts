import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../models/User";
import { RequestHandler } from 'express';

dotenv.config(); // Charger les variables d'environnement

export const registerUser: RequestHandler = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "Email déjà utilisé." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ message: "Utilisateur créé avec succès.", user: newUser });
    } catch (error) {
        console.error("Erreur dans l'inscription de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const loginUser: RequestHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Email ou mot de passe invalide." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Email ou mot de passe invalide." });
            return;
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "defaultSecretKey", // Utiliser la clé depuis .env
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Connexion réussie.",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Erreur dans la connexion de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const getUserProfile: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.body.userId; 
        const user = await User.findById(userId).select("-password");

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé." });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Erreur dans la récupération du profil utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
