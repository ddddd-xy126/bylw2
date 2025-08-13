import dotenv from 'dotenv';

dotenv.config();

const number = (value, fallback) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};

export const config = {
	env: process.env.NODE_ENV || 'development',
	server: {
		port: number(process.env.PORT, 3001),
		corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'dev_secret',
		expiresIn: process.env.JWT_EXPIRES_IN || '2h'
	},
	db: {
		host: process.env.MYSQL_HOST || '127.0.0.1',
		port: number(process.env.MYSQL_PORT, 3307),
		user: process.env.MYSQL_USER || 'root',
		password: process.env.MYSQL_PASSWORD || 'example',
		database: process.env.MYSQL_DATABASE || 'lw_survey'
	},
	ai: {
		baseUrl: process.env.KOZI_API_BASE_URL || 'https://api.kozi.example.com',
		apiKey: process.env.KOZI_API_KEY || ''
	}
};
