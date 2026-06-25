import jwt from "jsonwebtoken"
import { readFileSync } from "node:fs"

const pub_key = readFileSync('./pub.pem')

//Helper Section

function getToken(authHeader) {
    const splits = authHeader.split(' ')

    if (splits[0] === 'Bearer' && splits[1]) {
        return splits[1]
    } else {
        return null
    }
}

//Helper End

export const userAuth = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: "Authorisation Error", message: "The user is not logged in or there was an error while verifying. Please log in again." })
    }

    const token = getToken(authHeader)

    if (!token) {
        return res.status(401).json({ error: "Authorisation Error", message: "The user is not logged in or there was an error while verifying. Please log in again." })
    }

    const result = jwt.verify(token, pub_key, { algorithms: ['RS256'] })

    req.user = result

    next()
}

export const isAdmin = (req, res, next) => {
    const { role } = req.user

    if (role === 'admin') {
       next()
    } else {
        res.status(403).json({ error: "Underprivelaged", message: "You do not permission to access this resource." })
    }

}

export const isLoggedIn = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return next()
    }

    const token = getToken(authHeader)

    if (!token) {
        next()
    }

    try {
        const result = jwt.verify(token, pub_key, { algorithms: ['RS256'] })
        res.status(400).json({ error: "Already Logged In", message: `You are already logged in as ${ result.name }` })
    } catch (err) {
        next()
    }
}