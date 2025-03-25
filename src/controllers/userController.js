import { user } from '../models/User.js'
import bcrypt from 'bcrypt'
import generateToken from '../utils/generateToken.js'

class UserController {

    static async getUsers(req, res) {
        try {
            const users = await user.find({}).exec()
            res.status(200).json(users)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async getUser(req, res) {
        const { id } = req.params
        try {
            const userFound = await user.findById(id)
            if (!userFound) {
                return res.status(404).send('User not found')
            }
            res.status(200).json({ msg: 'User found ', userFound })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async createUser(req, res) {
        const { name, email, password, confirmpassword } = req.body
        if (!name) {
            return res.status(400).send('Name is required')
        }
        if (!email) {
            return res.status(400).send('Email is required');
        }
        if (!password) {
            return res.status(400).send('Password is required');
        }
        if (password !== confirmpassword) {
            return res.status(400).send('Password does not match');
        }

        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password, salt)

        const createdUser = {
            name,
            email,
            password: hashedPassword
        }

        try {
            const userExists = await user.findOne({ email: email })
            if (userExists) {
                return res.status(400).send('User already exists')
            }

            const newUser = await user.create(createdUser)
            res.status(201).json({ msg: 'User created successfully', newUser })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async updateUser(req, res) {
        const { id } = req.params
        try {
            const userFound = await user.findById(id)
            if (!userFound) {
                return res.status(404).send('User not found')
            }
            await userFound.updateOne(req.body)
            res.status(200).json({ msg: "User updated successfully", userFound })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async deleteUser(req, res) {
        const { id } = req.params
        try {
            const userFound = await user.findById(id)
            if (!userFound) {
                return res.status(404).send('User not found')
            }
            await userFound.deleteOne()
            res.status(200).json({ msg: "User deleted successfully", userFound })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async login(req, res) {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).send('Email is required');
        }

        if (!password) {
            return res.status(400).send('Password is required');
        }

        const userExists = await user.findOne({ email: email })

        if (!userExists) {
            return res.status(400).send('Invalid user')
        }

        const validPassword = await bcrypt.compare(password, userExists.password)

        if (!validPassword) {
            return res.status(400).send('Invalid password')
        }

        try {
            const token = generateToken(userExists)
            res.status(200).json({ msg: 'Login successful', token, id: userExists._id });
        } catch (error) {
            res.status(500).send('Something went wrong in the server')
        }
    }

    static async dashboard(req, res) {
        const { id } = req.params
        try {
            const userFound = await user.findById(id)
            if (!userFound) {
                return res.status(404).send('User not found')
            }
            res.status(200).json({ msg: 'Welcome to your dashboard', userFound })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }
}

export default UserController