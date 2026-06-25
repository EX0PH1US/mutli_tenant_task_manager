import { Router } from "express";
import { login, logout, refresh, registerOrg, registerStaff } from "../controllers/auth.js"
import { userAuth, isLoggedIn } from "../middlewares/authenticators.js"
const router = Router()

router.post('/register/org', isLoggedIn, registerOrg)
router.post('/login', isLoggedIn, login)
router.post('/register/staff', isLoggedIn, registerStaff)
router.post('/refresh', isLoggedIn, refresh)
router.post('/logout', userAuth, logout)

export default router
