import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String },
}, { versionKey: false }) // timestamp: true

const user = mongoose.model("users", userSchema)

export { user, userSchema }