import bcrypt from "bcrypt"
import User from "../models/user.js"
import jwt from "jsonwebtoken"
import Organisation from "../models/organisation.js"
import { readFileSync } from "node:fs"
import 'dotenv/config'
import RefreshToken from "../models/refreshToken.js"
import slugify from "slugify"

const priv_key = readFileSync(process.env.PRIV)
const pub_key = readFileSync('./pub.pem')

export const registerOrg = async (req, res, next) => {

    const { email, orgName, password, name } = req.body

    const slug = slugify(orgName, { lower: true, strict: true })
    const hashPass = await bcrypt.hash(password, 12)

    let org

    try { 
        org = await Organisation.create({ name: orgName, slug })
        const user = await User.create({ email, name, password: hashPass, organisation: org._id, role: 'admin' })
        res.status(201).json({ status: "Success", message: "Organisation and Owner User Successfully created!", orgId: org._id, userId: user._id })
    } catch (err) {
        if (org) {
            await Organisation.findByIdAndDelete(org)
        }
        //return res.status(500).json({ error: "Internal Server Error", message: "Something went wrong during registration." })
        next(err)
    }

}

export const registerStaff = async (req, res) => {
    const { email, name, orgSlug, orgId } = req.body

    let org = null

    if (orgId) {
        org = await Organisation.findById(orgId)
    } else {
        org = await Organisation.findOne({ slug: orgSlug })
    }

    if (!org) {
        return res.status(404).json({ error: "Orgnisation Not Found!", message: `Organisation ` })
    }

    const hashPass = await bcrypt.hash(password, 12)

    const user = await User.create({ email, name, password: hashPass, organisation: org._id })
    res.status(201).json({ status: "Success", message: `Successfully created User: ${ user.name }, ID: ${ user._id }, Organisation: ${ org.name }` })
}

export const login = async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(401).json({ error: "Login Error", message: "Email or Password is incorrect." })
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Login Error",message: "Email or Password is incorrect." })
    }

    const payload = {
        email: user.email,
        name: user.name,
        userid: user._id,
        orgId: user.organisation._id,
        role: user.role
    }

    const token = jwt.sign(payload, priv_key, { algorithm: 'RS256', expiresIn: '10m' })
    const refreshToken = jwt.sign(payload, priv_key, { algorithm: 'RS256', expiresIn: '7d' })

    await RefreshToken.create({ token: refreshToken, user: user._id })

    res.cookie('refeshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ status: "Success", message: `Logged in successfully as ${ user.name }`, token: token })

}

export const refresh = async (req, res) => {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
        return res.status(400).json({ error: "Token not found!", message: "Refresh Token is missing!" })
    }

    const rtoken = await RefreshToken.findOne({ token: refreshToken })

    if (!rtoken) {
        return res.status(400).json({ error: "Invalid Token", message: "Token is invalid" })
    }

    const payload = jwt.verify(rtoken, pub_key, { algorithms: ['RS256'] })

    const newToken = jwt.sign(payload, priv_key, { algorithm: 'RS256', expiresIn: '10m' })

    res.json({ status: "Success", token: newToken })

}

export const logout = async (req, res) => {
    const { refreshToken } = req.cookies

    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken })
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }) 

    res.json({ status: "Success", message: "Successfully Logged Out from this device." })
}

export const kickUser = async (req, res) => {
    const { id } = req.body

    const user = await User.findByIdAndDelete(id)

    res.json({ status: "Kicked", message: `Successfully kicked ${ user.name }, UserID: ${ user._id } from Org: ${ req.user.orgId }` })
}