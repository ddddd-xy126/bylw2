import { Router } from 'express'
import { authRequired } from '../middleware/authMiddleware.js'
import { list, create, getById } from '../controllers/questionnaireController.js'

const router = Router()

router.get('/', list)
router.post('/', authRequired(), create)
router.get('/:id', getById)

export default router


