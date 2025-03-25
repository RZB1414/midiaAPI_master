import express from 'express'
import routes from './routes/index.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: '*', // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(cookieParser())
app.use(express.json({ limit: '1000mb' }))
app.use(express.urlencoded({ limit: '1000mb', extended: true }))

app.use((req, res, next) => {
    req.setTimeout(20000, () => { 
        res.status(504).send('app.js error: Request has timed out.')
    })
    next()
})

routes(app)

export default app