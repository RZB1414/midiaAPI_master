import mongoose from "mongoose"

const fileSchema = new mongoose.Schema({
    id: {type: mongoose.Schema.Types.ObjectId},
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export default fileSchema