import Organisation from "../models/organisation.js"
import User from "../models/user.js"
import Task from "../models/task.js"
import organisation from "../models/organisation.js"

export const addTask = async (req, res) => {
    const user = req.user
    const { title, body, assignedTo } = req.body

    const assignedMember = await User.findOne({ _id: assignedTo, organisation: user.orgId })

    if (!assignedMember) {
        return res.status(404).json({ error: "Not Found", message: "Assigned Member doesn't exist!" })
    }

    const task = await Task.create({ title, body, assignedTo: assignedMember._id, orgId: user.orgId, assignedBy: user.userid })

    res.status(201).json({ status: "Created", message: `Task has been created successfully. ID: ${ task._id }, Assigned By: ${ user.name }` })
}

export const getAllTasks = async (req, res) => {
    const { orgId } = req.user

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const skipIdx = (page - 1) * limit

    const tasks = await Task.find({ orgId }).populate('orgId', 'name').populate('assignedTo', 'name').populate('assignedBy', 'name').sort({ createdAt: -1 }).skip(skipIdx).limit(limit)

    const totalDocuments = await Task.countDocuments({ orgId })

    const totalCount = Math.ceil(totalDocuments / limit)

    res.json({
        tasks: tasks,
        meta: {
            currentPage: page,
            limit: limit, 
            totalPages: totalCount
        }
    })
}

export const getMyTasks = async (req, res) => {
    const { orgId, userid } = req.user

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const skipIdx = (page - 1) * limit 

    const tasks = await Task.find({ orgId, assignedTo: userid }).populate('orgId', 'name').populate('assignedTo', 'name').populate('assignedBy', 'name').sort({ createdAt: -1 }).skip(skipIdx).limit(limit)

    const totalDocuments = await Task.countDocuments({ orgId, assignedTo: userid })

    const totalCount = Math.ceil(totalDocuments / limit)

    res.json({
        tasks: tasks,
        meta: {
            currentPage: page,
            limit: limit, 
            totalPages: totalCount
        }
    })
}

export const editTask = async (req, res) => {
    const { orgId, userid, role } = req.user
    const { id } = req.params
    const { assignedTo, title, body } = req.body

    let task = await Task.findOne({ _id: id, orgId })

    if (!task) {
        return res.status(404).json({ error: "Not Found", message: "Task not found." })
    }

    console.log(task.assignedBy)

    if (!task.assignedBy.equals(userid) && role !== 'admin') {
        return res.status(403).json({ error: "Task was not assigned by current User", message: "You dont have permission to edit this task." })
    }

    const assignedMember = await User.findOne({ _id: assignedTo, organisation: orgId })

    if (!assignedMember) {
        return res.status(404).json({ error: "Not Found", message: "Assigned Member doesn't exist!" })
    }

    task = await Task.findOneAndReplace({ _id: id, orgId }, { title, body, assignedTo, orgId, assignedBy: userid }, { new: false, runValidators: true })

    res.json({ status: "Success", message: `Task: ${ task._id } has been updated!` })

}

export const deleteTask = async (req, res) => {
    const { orgId, userid, role } = req.user
    const { id } = req.params

    if (!id) {
        return res.status(400).json({ error: "Bad Request", message: "ID not mentioned" })
    }

    let task = await Task.findOne({ _id: id, orgId })

    if (!task) {
        return res.status(404).json({ error: "Not Found", message: "Task does not exist." })
    }

    if (!task.assignedBy.equals(userid) && role !== 'admin') {
        return res.status(403).json({ error: "Task was not assigned by current User", message: "You dont have permission to edit this task." })
    }
    
    task = await Task.findOneAndDelete({ _id: id, orgId })

    if (!task) {
        return res.status(404).json({ error: "Not Found", message: "Task not found in organisation Task DB." })
    }

    res.json({ status: "Deleted", message: `Task: ${ task._id } has been removed.` })
}