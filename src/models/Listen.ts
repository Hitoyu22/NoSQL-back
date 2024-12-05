import { Schema, model } from "mongoose";


const ListenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: Schema.Types.ObjectId, ref: "Song", required: true },
    playedAt: { type: Date, default: Date.now }
});

export const Listen = model("Listen", ListenSchema);

