import express, { Request, Response } from "express";
import { Artist } from "../models/Artist";
import { Song } from "../models/Song";
import { RequestHandler } from 'express';
import { User } from "../models/User";


export const listArtists : RequestHandler = async (req, res, next) => {
    try {
        const artists = await Artist.find().populate("songs");
        res.status(200).json(artists);
    } catch (error) {
        console.error("Erreur lors de la récupération des artistes:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const addArtist: RequestHandler = async (req, res, next) => {
    const userId = req.body.userId; 

    if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const { name, bio, profilePictureUrl, genres } = req.body;

    try {
        const newArtist = new Artist({
            name,
            bio,
            profilePictureUrl,
            genres,
            userId
        });

        await newArtist.save();
        res.status(201).json({ message: "Artiste créé avec succès.", artist: newArtist });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const getArtistById : RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        const artist = await Artist.findById(id).populate("songs");
        if (!artist) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }
        res.status(200).json(artist);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const getArtistByUser: RequestHandler = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const artist = await Artist.findOne({ userId }).populate("songs");
        if (!artist) {
            res.status(204).json({ message: "Artiste non trouvé." });
            return;
        }
        res.status(200).json(artist);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const updateArtist : RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const { name, bio, profilePictureUrl, genres } = req.body;
    try {
        const artist = await Artist.findByIdAndUpdate(
            id,
            { name, bio, profilePictureUrl, genres },
            { new: true }
        );
        if (!artist) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }
        res.status(200).json(artist);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const deleteArtist : RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        const artist = await Artist.findByIdAndDelete(id);
        if (!artist) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }
        res.status(200).json({ message: "Artiste supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

export const listArtistSongs : RequestHandler = async (req, res, next) => {
    const { id } = req.params;
    try {
        const artist = await Artist.findById(id).populate("songs");
        if (!artist) {
            res.status(404).json({ message: "Artiste non trouvé." });
            return;
        }
        res.status(200).json(artist.songs);
    } catch (error) {
        console.error("Erreur lors de la récupération des chansons de l'artiste:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};