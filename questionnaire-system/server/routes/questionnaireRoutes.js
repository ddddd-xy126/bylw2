import { Router } from 'express'
import { authRequired } from '../middleware/authMiddleware.js'
import { list, create } from '../controllers/questionnaireController.js'

const router = Router()

router.get('/', list)
router.post('/', authRequired(), create)

export default router


