import express from "express";
import { createPlaylist, getUserPlaylists, addSongToPlaylist, getPlaylistWithSongs, removeSongFromPlaylist, deletePlaylist,getOnePlaylist,updatePlaylist } from "../controllers/playlistControllers";

const router = express.Router();

// Liste des routes pour les playlists

router.post("/", createPlaylist);
router.get("/:id", getUserPlaylists);
router.post("/:idPlaylist/songs", addSongToPlaylist);
router.get("/:idPlaylist/all", getPlaylistWithSongs);
router.delete("/:idPlaylist/songs/:idSong", removeSongFromPlaylist);
router.delete("/:idPlaylist", deletePlaylist);
router.get("/one/:idPlaylist", getOnePlaylist);
router.put("/:idPlaylist", updatePlaylist);


export default router;
