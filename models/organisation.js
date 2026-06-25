import mongoose from "mongoose"

const orgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organisation name is required!']
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
})

export default mongoose.model('Organisation', orgSchema)