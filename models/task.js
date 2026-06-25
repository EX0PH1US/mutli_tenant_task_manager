import mongoose, { mongo } from "mongoose"

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task Title is required!']
    },
    body: {
        type: String,
        required: [true, 'Task Body is required!']
    },
    orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organisation',
        index: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    complete: {
        type: Boolean,
        default: false
    }
})

export default mongoose.model('Task', taskSchema)