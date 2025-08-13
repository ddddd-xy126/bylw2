import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// NOTE: 演示用内存用户表。实际项目请使用数据库。
const users = new Map(); // key: identifier(email/phone), value: { id, passwordHash }
let userAutoId = 1;

// 预置演示用户
(() => {
	const identifier = 'demo@example.com';
	const passwordHash = bcrypt.hashSync('demopass', 10);
	users.set(identifier, { id: userAutoId++, passwordHash });
})();

const router = Router();

router.post(
	'/register',
	body('identifier').isString().trim().notEmpty(),
	body('password').isString().isLength({ min: 6 }),
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

		const { identifier, password } = req.body;
		if (users.has(identifier)) {
			return res.status(409).json({ message: '用户已存在' });
		}
		const passwordHash = bcrypt.hashSync(password, 10);
		const id = userAutoId++;
		users.set(identifier, { id, passwordHash });
		return res.json({ id, identifier });
	}
);

router.post(
	'/login',
	body('identifier').isString().trim().notEmpty(),
	body('password').isString().notEmpty(),
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { identifier, password } = req.body;
		const user = users.get(identifier);
		if (!user) return res.status(401).json({ message: '账号或密码错误' });
		const ok = bcrypt.compareSync(password, user.passwordHash);
		if (!ok) return res.status(401).json({ message: '账号或密码错误' });
		const token = jwt.sign({ sub: user.id, identifier }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
		return res.json({ token, expiresIn: config.jwt.expiresIn });
	}
);

router.post(
	'/forgot',
	body('identifier').isString().trim().notEmpty(),
	(req, res) => {
		// 占位：发送验证码/重置链接逻辑
		return res.json({ message: '重置请求已接收（占位）' });
	}
);

export default router;
