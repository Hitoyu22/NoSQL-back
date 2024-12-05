import { Schema, model } from "mongoose";

const GenreSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }
});

export const Genre = model("Genre", GenreSchema);
