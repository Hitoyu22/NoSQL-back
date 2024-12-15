import { Schema, model } from "mongoose";

const SongSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    filePath: { type: String, required: true },
    coverImageUrl: { type: String },
    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});


export const Song = model("Song", SongSchema);
