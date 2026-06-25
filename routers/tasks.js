import { Router } from "express";
import { userAuth, isAdmin } from "../middlewares/authenticators.js";
import { addTask, getAllTasks, getMyTasks, deleteTask, editTask } from "../controllers/tasks.js";

const router = Router()

router.get('/all', userAuth, getAllTasks)
router.get('/my', userAuth, getMyTasks)
router.post('/add', userAuth, addTask)
router.put('/edit', userAuth, editTask)
router.delete('/delete', userAuth, deleteTask)

export default router