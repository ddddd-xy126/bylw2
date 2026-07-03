require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    // 云数据库（TiDB Cloud / Aiven 等）通常强制 SSL，设置 DB_SSL=true 开启
    dialectOptions:
      process.env.DB_SSL === "true"
        ? { ssl: { rejectUnauthorized: true, minVersion: "TLSv1.2" } }
        : {},
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+08:00", // 东八区
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  }
);

module.exports = sequelize;
