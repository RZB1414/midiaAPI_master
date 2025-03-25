import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadDate: { type: Date, default: Date.now }
})

export default videoSchema