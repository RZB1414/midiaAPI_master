import express from "express"
import checkToken from "../middlewares/checkToken.js"
import BookController from "../controllers/bookController.js"
import multer from 'multer'

const routes = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage })

routes.get('/auth/books', checkToken, BookController.getBooks)
routes.get('/auth/book/:id', checkToken, BookController.getBook)
routes.get('/auth/books/upload', checkToken, BookController.getAllBooksUploaded)
routes.get('/auth/book/:id/upload', checkToken, BookController.getBookUploaded)
routes.get('/auth/book/:id/download', checkToken, BookController.downloadTextFile)
routes.post('/auth/addBook', checkToken, BookController.createBook)
routes.post('/auth/book/:id/upload', checkToken, upload.single('textFile'), BookController.uploadTextFile)
// routes.patch('/auth/book/:id', BookController.updateBook)
routes.delete('/auth/book/:id', checkToken, BookController.deleteBook)
routes.delete('/auth/books', checkToken, BookController.deleteAllBooks)

export default routes