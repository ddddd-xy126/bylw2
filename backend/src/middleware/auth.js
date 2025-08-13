import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const authenticateJwt = (req, res, next) => {
	const authHeader = req.headers['authorization'] || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) {
		return res.status(401).json({ message: '未授权：缺少令牌' });
	}
	try {
		const payload = jwt.verify(token, config.jwt.secret);
		req.user = payload;
		return next();
	} catch (err) {
		return res.status(401).json({ message: '未授权：令牌无效或过期' });
	}
};
