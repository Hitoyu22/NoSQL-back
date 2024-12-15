import { Request, Response, NextFunction, RequestHandler } from "express";
import { Playlist } from "../models/Playlist";
import { Song } from "../models/Song";
import mongoose from "mongoose";


// Route pour créer une playlist
export const createPlaylist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { name, description, isPublic, user } = req.body;

    if (!user) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
    }
    const userId = new mongoose.Types.ObjectId(user);


    const newPlaylist = new Playlist({
        name,
        description,
        user: userId,
        isPublic: isPublic || false,
    });

    try {
        await newPlaylist.save();
        res.status(201).json({ message: "Playlist créée avec succès", playlist: newPlaylist });
    } catch (error) {
        console.error("Erreur lors de la création de la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Route pour récupérer toutes les playlists d'un user
export const getUserPlaylists: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    if (!userId) {
        res.status(401).json({ message: "Utilisateur non authentifié" });
        return;
    }

    try {
        const playlists = await Playlist.find({ user: userId }).select("-songs");
        res.status(200).json(playlists);
    } catch (error) {
        console.error("Erreur lors de la récupération des playlists:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Route pour ajouter une chanson à une playlist
export const addSongToPlaylist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { idPlaylist } = req.params;
    const { idSong } = req.body;

    try {
        const playlist = await Playlist.findById(idPlaylist);

        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        if (playlist.songs.includes(idSong)) {
            res.status(400).json({ message: "Cette chanson est déjà dans la playlist." });
            return;
        }

        playlist.songs.push(idSong);
        await playlist.save();

        res.status(200).json({ message: "Chanson ajoutée à la playlist", playlist });
    } catch (error) {
        console.error("Erreur lors de l'ajout de la chanson à la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Route pour récupérer une playlist avec les chansons incluses
export const getPlaylistWithSongs: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const {idPlaylist} = req.params;

    try {
        const playlist = await Playlist.findById(idPlaylist).populate("songs");

        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        res.status(200).json(playlist);
    } catch (error) {
        console.error("Erreur lors de la récupération de la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

// Route pour supprimer une chanson d'une playlist
export const removeSongFromPlaylist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { idPlaylist, idSong } = req.params;

    try {
        const playlist = await Playlist.findById(idPlaylist);
        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        const songId = new mongoose.Types.ObjectId(idSong);

        const songIndex = playlist.songs.indexOf(songId);
        if (songIndex === -1) {
            res.status(404).json({ message: "Chanson non trouvée dans la playlist" });
            return;
        }

        playlist.songs.splice(songIndex, 1);
        await playlist.save();

        res.status(200).json({ message: "Chanson supprimée de la playlist", playlist });
    } catch (error) {
        console.error("Erreur lors de la suppression de la chanson de la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};


// Route pour supprimer une playlist
export const deletePlaylist: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { idPlaylist } = req.params;

    try {
        const playlist = await Playlist.findByIdAndDelete(idPlaylist);

        if (!playlist) {
            res.status(404).json({ message: "Playlist non trouvée" });
            return;
        }

        res.status(200).json({ message: "Playlist supprimée avec succès", playlist });
    } catch (error) {
        console.error("Erreur lors de la suppression de la playlist:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};