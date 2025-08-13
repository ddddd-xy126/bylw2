import mysql from 'mysql2/promise';
import { config } from '../config/index.js';

let pool;

export const getDbPool = () => {
	if (!pool) {
		pool = mysql.createPool({
			host: config.db.host,
			port: config.db.port,
			user: config.db.user,
			password: config.db.password,
			database: config.db.database,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0
		});
	}
	return pool;
};
