import { Schema, model } from "mongoose";

const PlaylistSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const Playlist = model("Playlist", PlaylistSchema);
