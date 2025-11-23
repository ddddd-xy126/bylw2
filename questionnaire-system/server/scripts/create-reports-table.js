const sequelize = require("../config/database");
const Report = require("../models/Report");

async function createReportsTable() {
  try {
    console.log("开始创建 reports 表...");

    // 删除旧表（如果存在）
    await sequelize.query("DROP TABLE IF EXISTS reports");
    console.log("已删除旧的 reports 表（如果存在）");

    // 同步 Report 模型到数据库
    await Report.sync({ force: true });

    console.log("✅ reports 表创建成功！");
    console.log("字段类型: userId(BIGINT), surveyId(BIGINT), answerId(BIGINT)");
    process.exit(0);
  } catch (error) {
    console.error("❌ 创建 reports 表失败:", error);
    process.exit(1);
  }
}

createReportsTable();
