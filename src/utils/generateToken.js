import jwt from 'jsonwebtoken'

const generateToken = (user) => {
    const secret = process.env.SECRET
    const token = jwt.sign({ id: user._id }, secret)
    return token
}

export default generateToken