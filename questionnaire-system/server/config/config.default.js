export default {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  db: {
    database: process.env.DB_NAME || "questionnaire_db",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "dxy040126..", // 真实密码
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false,
  },
  ai: {
    baseURL: process.env.AI_BASE_URL || "https://api.kouziai.example",
    apiKey: process.env.AI_API_KEY || "",
  },
};
