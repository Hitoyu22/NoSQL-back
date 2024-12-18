import { Schema, model } from "mongoose";

const SongSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    filePath: { type: String },
    coverImageUrl: { type: String, default : "https://media.tarkett-image.com/large/TH_24567081_24594081_24596081_24601081_24563081_24565081_24588081_001.jpg" },
    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});


export const Song = model("Song", SongSchema);
