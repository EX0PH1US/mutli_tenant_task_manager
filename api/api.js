import express from "express"
import mongoose from "mongoose"
import helmet from "helmet"
import { rateLimit } from "express-rate-limit"
import cookieParser from "cookie-parser"
import errorMiddleware from "../middlewares/errorMiddleware.js"
import 'dotenv/config'
import morgan from "morgan"
import taskRouter from "../routers/tasks.js"
import authRouter from "../routers/auth.js"
import cors from "cors"

const app = express()

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 250, 
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	ipv6Subnet: 64, 
    handler: (req, res, next, options) => {
        res.status(429).json({ error: "Too Many Requests", message: "Too many requests were sent to the server, try again in a few moments." })
    }
})

app.use(cors({
    origin: process.env.FRONT || 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-type', 'Authorization'],
    credentials: true
}))

app.use(rateLimit)
app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.use(morgon('common'))


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


