import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { analyzeAnswers } from '../services/aiClient.js';

const router = Router();

router.post(
	'/',
	body('answers').isArray({ min: 1 }),
	body('analysis_types').isArray({ min: 1 }),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { answers, analysis_types } = req.body;
		try {
			const result = await analyzeAnswers({ answers, analysisTypes: analysis_types });
			return res.json(result);
		} catch (err) {
			return res.status(502).json({ message: 'AI 服务调用失败', detail: err.message });
		}
	}
);

export default router;
