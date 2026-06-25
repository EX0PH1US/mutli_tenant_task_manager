import mongoose from "mongoose"

const rTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 604800
    }
})

export default mongoose.model('RefreshToken', rTokenSchema)