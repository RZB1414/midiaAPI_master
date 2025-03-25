import mongoose from "mongoose"
import { GridFSBucket } from "mongodb"
import dns from "dns"

dns.setDefaultResultOrder('ipv4first')

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS
let connection
let bucket
let pdfFiles
let videoFiles

async function dbConnection() {
    const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.eqwke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    //const uri = `mongodb://Buiatti:Banco14R@localhost:27017/admin`

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10
        })
        console.log('Connected to MongoDB')

        connection = mongoose.connection
        const db = connection.db
        bucket = new GridFSBucket(db, {
            bucketName: 'bookFiles'
        })
        pdfFiles = new GridFSBucket(db, {
            bucketName: 'pdfFiles'
        })
        videoFiles = new GridFSBucket(db, {
            bucketName: 'videoFiles'
        })

    } catch (error) {
        console.error('dbconnect Error:', {
            message: error.message,
            code: error.code,
            name: error.name
        })
        connection = null
        bucket = null
        pdfFiles = null
        videoFiles = null
    }
}

export { dbConnection, connection, bucket, pdfFiles, videoFiles }