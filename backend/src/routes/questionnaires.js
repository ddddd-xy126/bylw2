import { Router } from 'express';

const router = Router();

// 示例内存数据
const questionnaires = [
	{ id: 1, title: '职业倾向测试', status: 'published' },
	{ id: 2, title: '学习能力评估', status: 'published' }
];

router.get('/', (req, res) => {
	const { status } = req.query;
	const list = status ? questionnaires.filter(q => q.status === status) : questionnaires;
	res.json(list);
});

router.get('/:id', (req, res) => {
	const id = Number(req.params.id);
	const found = questionnaires.find(q => q.id === id);
	if (!found) return res.status(404).json({ message: '问卷不存在' });
	// 占位：返回题目与跳转逻辑配置
	res.json({ ...found, questions: [], logic: [] });
});

router.post('/:id/submit', (req, res) => {
	const id = Number(req.params.id);
	const found = questionnaires.find(q => q.id === id);
	if (!found) return res.status(404).json({ message: '问卷不存在' });
	// 占位：保存答案、计算积分、触发成就
	res.json({ message: '提交成功', score: 10 });
});

export default router;
