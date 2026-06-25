import express from "express"
import mongoose from "mongoose"
import helmet from "helmet"
import { rateLimit } from "express-rate-limit"
import cookieParser from "cookie-parser"
import errorMiddleware from "./middlewares/errorMiddleware.js"
import 'dotenv/config'
import taskRouter from "./routers/tasks.js"
import authRouter from "./routers/auth.js"

const app = express()

app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())


try {
    await mongoose.connect(process.env.URL)
    console.log('Connected To Database!')
} catch (err) {
    console.error(err)
}

app.use('/tasks', taskRouter)
app.use('/', authRouter)

app.use ((req, res, next) => {
    res.status(404).json({ error: "Not Found", message: `Cannot ${req.method} ${req.originalUrl} on this server.` })
})

app.use(errorMiddleware)

app.listen(3000, (req, res) => {
    console.log("Working on port 3000!")
})


