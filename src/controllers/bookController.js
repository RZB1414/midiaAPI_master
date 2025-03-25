import book from '../models/Book.js'
import { connection, bucket} from '../config/dbConnect.js'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage })

class BookController {

    static async getBooks(req, res) {
        try {
            const books = await book.find({})
            res.status(200).json(books)
            
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async getBook(req, res) {
        const { id } = req.params
        try {
            const bookFound = await book.findOne({id : id})
            res.status(200).json(bookFound)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async createBook(req, res) {
        const { id, imgUrl, title, author, releaseDate, description, pageCount, users } = req.body

        if(!id) {
            return res.status(400).send('ID is required')
        }
        if(!imgUrl) {
            return res.status(400).send('Image URL is required')
        }
        if(!title) {
            return res.status(400).send('Title is required')
        }
        if(!author) {
            return res.status(400).send('Author is required')
        }

        const createdBook = {
            id,
            imgUrl,
            title,
            author,
            releaseDate,
            description,
            pageCount,
            users
        }

        try {
            const newBook = await book.create(createdBook)
            res.status(201).json({ msg: 'Book created successfully', newBook })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async uploadTextFile(req, res) {
        const { id } = req.params

        if(!connection || !bucket) {
            return res.status(500).json({ msg: 'Error connecting to the database' })
        }

        const textFile = req.file        

        if(!textFile) {
            return res.status(400).json({ msg: 'Text file is required' })
        }

        const uploadStream = bucket.openUploadStream(textFile.originalname, {
            contentType: textFile.mimetype,
        })

        uploadStream.end(textFile.buffer)

        uploadStream.on('finish', async () => {
            try {
                await book.findOneAndUpdate({ id: id }, { textFileId: uploadStream.id })
                res.status(200).json({ msg: 'Text file uploaded successfully' })
            } catch (error) {
                res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
            }
        })

        uploadStream.on('error', (error) => {
            res.status(500).json({ msg: 'Error uploading text file', error: error.message })
        })
    }

    static async getBookUploaded(req, res) {
        const { id } = req.params
        
        if(!connection || !bucket) {
            return res.status(500).json({ msg: 'Error connecting to the database' })
        }

        try {
            const bookFound = await book.findOne({ id: id })
            if(!bookFound) {
                return res.status(404).json({ msg: 'Book not found' })
            }

            if(!bookFound.textFileId) {
                return res.status(200).json({ msg: 'Text file not found' })
            }

            const uploadedFile = await bucket.find({ _id: bookFound.textFileId }).toArray()

            res.status(200).json({ hasFile: true, uploadedFile: uploadedFile[0]})
            
    }   catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async getAllBooksUploaded(req, res) {
        if (!connection || !bucket) {
            return res.status(500).json({ msg: 'Error connecting to the database' });
        }

        try {
            const books = await book.find({ textFileId: { $exists: true } })
            const booksWithFiles = await Promise.all(books.map(async (book) => {
                const uploadedFile = await bucket.find({ _id: book.textFileId }).toArray();
                return {
                    ...book.toObject(),
                    hasFile: uploadedFile.length > 0,
                    file: uploadedFile[0] || null
                };
            }));

            return res.status(200).json(booksWithFiles);
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
        }
    }

    static async downloadTextFile(req, res) {
        const { id } = req.params

        if(!connection || !bucket) {
            return res.status(500).json({ msg: 'Error connecting to the database' })
        }

        try {
            const bookFound = await book.findOne({ id: id })
            if(!bookFound) {
                return res.status(404).json({ msg: 'Book not found' })
            }

            if(!bookFound.textFileId) {
                return res.status(404).json({ msg: 'Text file not found' })
            }

            const uploadedFile = await bucket.find({ _id: bookFound.textFileId }).toArray()

            if(uploadedFile.length === 0) {
                return res.status(404).json({ msg: 'Text file not found' })
            }

            const file = uploadedFile[0]
            res.set('Content-Type', file.contentType)
            res.set('Content-Disposition', `attachment; filename=${file.filename}`)
            bucket.openDownloadStream(file._id).pipe(res)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async deleteBook(req, res) {
        const { id } = req.params
        try {
            await book.findOneAndDelete({id : id})
            res.status(200).json({ msg: 'Book deleted successfully' })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async deleteAllBooks(req, res) {
        try {
            await book.deleteMany({})
            res.status(200).json({ msg: 'All books deleted successfully' })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }
}

export default BookController