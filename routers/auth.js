import { Router } from "express";
import { kickUser, login, logout, refresh, registerOrg, registerStaff } from "../controllers/auth.js"
import { userAuth, isLoggedIn, isAdmin } from "../middlewares/authenticators.js"
const router = Router()
import { rateLimit } from "express-rate-limit"

const authLimiter = rateLimit({
    windowMs: 2 * 60 * 60 * 1000,
    limit: 50,
    keyGenerator: (req, res) => req.body.username || ipKeyGenerator(req.ip),
    handler: (req, res, next, options) => {
        res.status(429).json({ error: "Too Many Attempts", message: "Too many login/registration attempts, try again later in a few moments." })
    }
})

router.post('/register/org', isLoggedIn, registerOrg)
router.post('/login', authLimiter, isLoggedIn, login)
router.post('/register/staff', isLoggedIn, registerStaff)
router.post('/refresh', isLoggedIn, refresh)
router.post('/logout', userAuth, logout)
router.delete('/kick/:id', userAuth, isAdmin, kickUser)

export default router
