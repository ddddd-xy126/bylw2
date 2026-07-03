// 一次性初始化脚本：插入默认分类 + 将用户提升为管理员
// 用法: node seed-init.js [要提升为管理员的用户名]
require("dotenv").config();
const sequelize = require("./config/database");

async function main() {
  const targetUsername = process.argv[2];

  await sequelize.authenticate();
  console.log("✅ 数据库连接成功");

  // 1. 插入分类（已存在则跳过）
  const categories = [
    ["cat_1", "教育培训", "education"],
    ["cat_2", "市场调研", "market-research"],
    ["cat_3", "用户体验", "user-experience"],
    ["cat_4", "心理测评", "psychology"],
    ["cat_5", "生活娱乐", "lifestyle"],
    ["cat_6", "健康医疗", "health"],
    ["cat_7", "科技数码", "technology"],
    ["cat_8", "其他", "other"],
  ];
  for (const [id, name, slug] of categories) {
    await sequelize.query(
      "INSERT IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)",
      { replacements: [id, name, slug] }
    );
  }
  console.log("✅ 分类初始化完成");

  // 2. 查看用户列表
  const [users] = await sequelize.query(
    "SELECT id, username, email, role FROM users"
  );
  console.table(users);

  // 3. 提升管理员
  if (targetUsername) {
    const [, meta] = await sequelize.query(
      "UPDATE users SET role = 'admin' WHERE username = ?",
      { replacements: [targetUsername] }
    );
    console.log(
      meta && meta.affectedRows !== undefined
        ? `✅ 已将 ${targetUsername} 设为管理员（影响 ${meta.affectedRows} 行）`
        : `✅ 已执行提升 ${targetUsername} 为管理员`
    );
  } else if (users.length === 1) {
    await sequelize.query("UPDATE users SET role = 'admin' WHERE id = ?", {
      replacements: [users[0].id],
    });
    console.log(`✅ 只有一个用户 ${users[0].username}，已自动设为管理员`);
  } else {
    console.log("ℹ️ 有多个用户，请指定用户名: node seed-init.js 用户名");
  }

  await sequelize.close();
}

main().catch((e) => {
  console.error("❌ 执行失败:", e.message);
  process.exit(1);
});
