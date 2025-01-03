import { Schema, model } from "mongoose";


const ArtistSchema = new Schema({
    name: { type: String, required: true },
    bio: { type: String },
    profilePictureUrl: { type: String },
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    createdAt: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },  
});


export const Artist = model("Artist", ArtistSchema);
