import { Router } from 'express'
import { register, login, profile } from '../controllers/userController.js'
import { authRequired } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/profile', authRequired(), profile)

export default router


