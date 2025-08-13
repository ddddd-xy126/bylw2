import { Router } from 'express';

const router = Router();

// 占位：发布流程（审核 -> 发布）
router.post('/questionnaires/:id/publish', (req, res) => {
	const id = Number(req.params.id);
	// TODO: 审核状态校验与状态流转 draft -> pending_review -> published
	res.json({ id, status: 'published' });
});

// 占位：题目逻辑配置 IF 选择A THEN 跳转至Q5
router.post('/questionnaires/:id/logic', (req, res) => {
	const id = Number(req.params.id);
	const { logic } = req.body;
	res.json({ id, saved: true, count: Array.isArray(logic) ? logic.length : 0 });
});

export default router;
