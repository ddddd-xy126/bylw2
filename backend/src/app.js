import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authenticateJwt } from './middleware/auth.js';

// Routers
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import questionnairesRouter from './routes/questionnaires.js';
import adminRouter from './routes/admin.js';
import analysisRouter from './routes/analysis.js';

const app = express();

app.use(cors({ origin: config.server.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Public routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/questionnaires', authenticateJwt, questionnairesRouter);
app.use('/api/admin', authenticateJwt, adminRouter);
app.use('/api/analysis', authenticateJwt, analysisRouter);

// 404
app.use((req, res) => {
	res.status(404).json({ message: '未找到资源' });
});

// Error handler
app.use((err, req, res, next) => {
	// eslint-disable-next-line no-console
	console.error('[Error]', err);
	res.status(500).json({ message: '服务器错误' });
});

export default app;
