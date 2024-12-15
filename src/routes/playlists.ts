import express from "express";
import { createPlaylist, getUserPlaylists, addSongToPlaylist, getPlaylistWithSongs, removeSongFromPlaylist, deletePlaylist } from "../controllers/playlistControllers";

const router = express.Router();

router.post("/", createPlaylist);

router.get("/:id", getUserPlaylists);

router.post("/:idPlaylist/songs", addSongToPlaylist);

router.get("/:idPlaylist/all", getPlaylistWithSongs);

router.delete("/:idPlaylist/songs/:idSong", removeSongFromPlaylist);

router.delete("/:idPlaylist", deletePlaylist);


export default router;
