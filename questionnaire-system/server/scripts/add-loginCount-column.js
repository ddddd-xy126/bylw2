const sequelize = require("../config/database");

async function addColumn() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    // 检查是否已有 loginCount 列
    const [cols] = await sequelize.query(
      "SHOW COLUMNS FROM `users` LIKE 'loginCount'"
    );
    if (cols.length > 0) {
      console.log("loginCount column already exists.");
      process.exit(0);
    }

    // 添加列
    await sequelize.query(
      "ALTER TABLE `users` ADD COLUMN `loginCount` INT DEFAULT 0;"
    );
    console.log("✅ 已添加 users.loginCount 列");
    process.exit(0);
  } catch (err) {
    console.error("❌ 添加列失败:", err);
    process.exit(1);
  }
}

addColumn();
