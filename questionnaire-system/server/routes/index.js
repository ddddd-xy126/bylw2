import { Router } from 'express'
import userRoutes from './userRoutes.js'
import questionnaireRoutes from './questionnaireRoutes.js'

const router = Router()
router.use('/user', userRoutes)
router.use('/questionnaire', questionnaireRoutes)

export default router


