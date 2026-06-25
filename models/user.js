import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: [true, 'Email is required!'],
        trim: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        require: [true, 'Name is required!']
    },
    password: {
        type: String,
        require: [true, 'Password is required']
    },
    organisation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        required: true,
        index: true
    },
    role: {
        type: String,
        default: 'member'
    }
})

export default mongoose.model('User', userSchema)