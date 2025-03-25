import express from 'express'
import checkToken from '../middlewares/checkToken.js'
import FileController from '../controllers/fileController.js'
import multer from 'multer'

const routes = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

routes.get('/auth/files', checkToken, FileController.getFiles)
routes.get('/auth/file/:id', checkToken, FileController.getFile)
routes.get('/auth/showFile/:id', FileController.showFile)
routes.post('/auth/uploadFile', checkToken, upload.single('textFile'), FileController.uploadFile)

export default routes