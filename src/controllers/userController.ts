import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../models/User";
import { RequestHandler } from 'express';
import { Song } from '../models/Song';
import { Artist } from '../models/Artist';
import mongoose, { Types } from 'mongoose';
import { Schema } from "mongoose";

dotenv.config();

// Route pour s'inscrire
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

// Route pour se connecter
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
            process.env.JWT_SECRET || "defaultSecretKey",
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

// Route pour récupérer le profil utilisateur
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

// Route pour update le profil utilisateur
export const updateUser: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { username, email, bio } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé." });
            return;
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (bio) user.bio = bio;

        await user.save();

        res.status(200).json({ message: "Profil mis à jour.", user });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour supprimer un utilisateur (à travailler encore car pas suppresion en cascade)
// Consistera plutôt en une anonymisation des données
export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé." });
            return;
        }

        await user.deleteOne();
        res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour récupérer les artistes préférés d'un utilisateur
export const getFavoriteArtists: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('favoriteArtists');

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé." });
            return;
        }

        res.status(200).json({ favoriteArtists: user.favoriteArtists });
    } catch (error) {
        console.error("Erreur lors de la récupération des artistes favoris:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour ajouter un artiste aux favoris
export const addFavoriteArtist: RequestHandler = async (req, res) => {
    try {
        const { userId, artistId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé." });
            return;
        }

        const artist = await Artist.findById(artistId);
        if (!artist) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }

        if (!user.favoriteArtists.includes(artistId)) {
            user.favoriteArtists.push(artistId);
            await user.save();
            res.status(200).json({ message: "Artiste ajouté aux favoris." });
        } else {
            res.status(400).json({ message: "Cet artiste est déjà dans vos favoris." });
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'artiste aux favoris:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Route pour retirer un artiste des favoris
export const unfavoriteArtist: RequestHandler = async (req, res) => {
    try {
        const userId = req.params.id;
        const artistId = req.params.idArtist;

        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(artistId)) {
            res.status(400).json({ message: "ID utilisateur ou artiste invalide." });
            return;  
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé." });
            return;  
        }

        user.favoriteArtists = user.favoriteArtists.filter((artist) => {
            return artist.toString() !== artistId;
        });
                await user.save();

        res.status(200).json({ message: "Artiste retiré des favoris.", favoriteArtists: user.favoriteArtists });
        return;  
    } catch (error) {
        console.error("Erreur lors du retrait de l'artiste des favoris:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
        return;  
    }
};