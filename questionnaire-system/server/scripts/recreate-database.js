/**
 * 数据库重建脚本
 * 此脚本会删除并重新创建数据库及所有表
 * ⚠️ 警告：会删除所有数据！仅用于开发环境！
 *
 * 使用方法：node scripts/recreate-database.js
 */

require("dotenv").config();
const mysql = require("mysql2/promise");

async function recreateDatabase() {
  let connection;

  try {
    console.log("🔧 开始重建数据库...\n");

    // 1. 创建到MySQL服务器的连接(不指定数据库)
    console.log("📡 连接到MySQL服务器...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
    });
    console.log("✅ MySQL连接成功\n");

    const dbName = process.env.DB_NAME || "questionnaire_db";

    // 2. 删除旧数据库
    console.log(`🗑️  删除旧数据库: ${dbName}`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log("✅ 旧数据库已删除\n");

    // 3. 创建新数据库
    console.log(`🆕 创建新数据库: ${dbName}`);
    await connection.query(
      `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log("✅ 新数据库创建成功\n");

    // 4. 验证数据库
    console.log("🔍 验证数据库...");
    const [databases] = await connection.query(
      `SHOW DATABASES LIKE '${dbName}'`
    );
    if (databases.length > 0) {
      console.log("✅ 数据库验证成功\n");
    }

    await connection.end();

    // 5. 使用Sequelize同步表结构
    console.log("📋 同步数据库表结构...");
    const { sequelize } = require("../models");

    await sequelize.authenticate();
    console.log("✅ 数据库连接成功");

    await sequelize.sync({ force: true });
    console.log("✅ 数据库表结构已创建\n");

    await sequelize.close();

    console.log("🎉 数据库重建完成！");
    console.log("\n📊 数据库信息:");
    console.log(`   名称: ${dbName}`);
    console.log(`   主机: ${process.env.DB_HOST || "localhost"}`);
    console.log(`   端口: ${process.env.DB_PORT || 3306}`);
    console.log(`   字符集: utf8mb4`);
    console.log("\n💡 提示: 现在可以运行 npm run dev 启动服务器了\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ 重建失败:", error.message);
    console.error("\n💡 请检查:");
    console.error("   1. MySQL服务是否正在运行");
    console.error("   2. .env文件中的数据库配置是否正确");
    console.error("   3. 数据库用户是否有足够的权限\n");

    if (connection) {
      await connection.end();
    }

    process.exit(1);
  }
}

recreateDatabase();
