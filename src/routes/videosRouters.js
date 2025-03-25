import express from 'express'
import checkToken from '../middlewares/checkToken.js'
import VideoController from '../controllers/videoController.js'
import multer from 'multer'

const routes = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

routes.get('/auth/videos', VideoController.getVideos)
routes.get('/auth/video/:id', VideoController.getVideo)
routes.post('/auth/uploadVideo', upload.single('videoFile'), VideoController.uploadVideo)
routes.get('/auth/downloadVideo/:id', VideoController.donwloadVideo)
routes.delete('/auth/deleteVideo/:id', VideoController.deleteVideo)

export default routes