import { Schema, model } from "mongoose";

const PlaylistSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    coverImageUrl: { type: String, default : "https://media.tarkett-image.com/large/TH_24567081_24594081_24596081_24601081_24563081_24565081_24588081_001.jpg" },
});

export const Playlist = model("Playlist", PlaylistSchema);
