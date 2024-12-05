import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    likedSongs: Schema.Types.ObjectId[];
    favoriteArtists: Schema.Types.ObjectId[];
    bio: string | null; 
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    likedSongs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    favoriteArtists: [{ type: Schema.Types.ObjectId, ref: "Artist" }],
    bio: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", UserSchema);
