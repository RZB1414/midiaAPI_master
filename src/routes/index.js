import express from 'express'
import users from './usersRoutes.js'
import books from './booksRouters.js'
import files from './filesRouters.js'
import videos from './videosRouters.js'

const routes = (app) => {
    app.route('/').get((req, res) => res.status(200).send(
        'Welcome to the Node.js, Express, and MongoDB API'
    ))

    app.use(express.json(), users, books, files, videos)
}

export default routes