import Organisation from "../models/organisation.js"
import User from "../models/user.js"
import Task from "../models/task.js"
import organisation from "../models/organisation.js"

export const addTask = async (req, res) => {
    const user = req.user
    const { title, body, assignedTo } = req.body

    const assignedMember = await User.findById(assignedTo)

    const task = await Task.create({ title, body, assignedTo: assignedMember._id, orgId: user.orgId, assignedBy: user.userid })

    res.status(201).json({ status: "Created", message: `Task has been created successfully. ID: ${ task._id }, Assigned By: ${ user.name }` })
}

export const getAllTasks = async (req, res) => {
    const { orgId } = req.user

    const page = req.params.page || 1
    const limit = req.params.limit || 5

    const skipIdx = (page - 1) * limit

    const tasks = await Task.find({ orgId }).populate('orgId', 'name').sort({ createdAt: -1 }).skip(skipIdx).limit(limit)

    const totalDocuments = await Task.countDocuments({ orgId })

    const totalCount = Math.ceil(totalDocuments / limit)

    res.json({
        tasks: tasks,
        currentPage: page,
        limit: limit, 
        totalPages: totalCount
    })
}

export const getMyTasks = async (req, res) => {
    const { orgId, userid } = req.user

    const page = req.params.page || 1
    const limit = req.params.limit || 5

    const skipIdx = (page - 1) * limit 

    const tasks = await Task.find({ orgId, assignedTo: userid })

    const totalDocuments = await Task.countDocuments({ orgId, assignedTo: userid })

    const totalCount = Math.ceil(totalDocuments / limit)

    res.json({
        tasks: tasks,
        currentPage: page,
        limit: limit, 
        totalPages: totalCount
    })
}

export const editTask = async (req, res) => {
    const { orgId, userid, role } = req.user
    const { id } = req.params

    let query

    if (role === 'admin') {
        query = { _id: id, orgId }
    } else {
        query = { _id: id, orgId, assignedBy: userid }
    }

    const task = await Task.findOneAndReplace(query, req.body, { new: false, runValidators: true })

    if (!task) {
        return res.status(404).json({ error: "Not Found", message: "Task not found." })
    }

    res.json({ status: "Success", message: `Task: ${ task._id } has been updated!` })

}

export const deleteTask = async (req, res) => {
    const { orgId, userid, role } = req.user
    const { id } = req.params

    let query

    if (role === 'admin') {
        query = { _id: id, orgId }
    } else {
        query = { _id: id, orgId, assignedBy: userid }
    }

    const task = await Task.findOneAndDelete(query)

    res.json({ status: "Deleted", message: `Task: ${ task._id } has been removed.` })
}