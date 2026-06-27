import User from "../models/user.js"
import Organisation from "../models/organisation.js"

export const getMembers = async (req, res) => {
    const { orgId } = req.user

    const page = parseInt(req.params.page) || 1
    const limit = parseInt(req.params.limit) || 5

    const skipIdx = (page - 1) * limit

    const users = await User.find({ organisation: orgId }).select('name email role').sort({ createdAt: -1 }).skip(skipIdx).limit(limit)
    const totalDocuments = await User.countDocuments({ organisation: orgId })
    const totalCount = Math.ceil(totalDocuments / limit)

    res.json({ 
        members: users,
        meta: {
            currentPage: page,
            limit: limit, 
            totalPages: totalCount
        }
    })

}
