import { Schema, model } from "mongoose";

const LikeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: Schema.Types.ObjectId, ref: "Song", required: true },
    createdAt: { type: Date, default: Date.now },
});

export const Like = model("Like", LikeSchema);
