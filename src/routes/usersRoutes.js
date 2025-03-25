import express from 'express'
import UserController from '../controllers/userController.js'
import checkToken from '../middlewares/checkToken.js'

const routes = express.Router()

routes.post('/auth/login', UserController.login)
routes.get('/auth/users', UserController.getUsers)
routes.get('/auth/user/:id', checkToken, UserController.getUser)
routes.post("/auth/register", UserController.createUser)
routes.patch('/auth/user/:id', UserController.updateUser)
routes.delete('/auth/user/:id', UserController.deleteUser)
routes.get('/auth/dashboard/:id', checkToken, UserController.dashboard)

export default routes