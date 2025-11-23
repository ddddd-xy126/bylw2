const sequelize = require("../config/database");

async function createReportsTableManual() {
  try {
    console.log("开始手动创建 reports 表...");

    // 删除旧表（如果存在）
    await sequelize.query("DROP TABLE IF EXISTS reports");
    console.log("已删除旧的 reports 表（如果存在）");

    // 手动创建表，避免外键问题
    await sequelize.query(`
      CREATE TABLE reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(50) NOT NULL COMMENT '用户ID',
        surveyId VARCHAR(50) DEFAULT NULL COMMENT '问卷ID',
        answerId VARCHAR(50) DEFAULT NULL COMMENT '答案ID',
        title VARCHAR(255) NOT NULL COMMENT '报告标题',
        content LONGTEXT COMMENT '报告内容',
        surveyTitle VARCHAR(255) DEFAULT NULL COMMENT '问卷标题',
        category VARCHAR(255) DEFAULT NULL COMMENT '问卷分类',
        status ENUM('generating', 'completed', 'failed') DEFAULT 'generating' COMMENT '报告状态',
        generatedAt DATETIME DEFAULT NULL COMMENT '生成时间',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        INDEX idx_userId (userId),
        INDEX idx_surveyId (surveyId),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ reports 表创建成功！");
    console.log("表结构:");
    console.log("  - id: INT (主键)");
    console.log("  - userId: VARCHAR(50) (匹配 users.id)");
    console.log("  - surveyId: VARCHAR(50) (匹配 surveys.id)");
    console.log("  - answerId: VARCHAR(50)");
    console.log("  - title: VARCHAR(255)");
    console.log("  - content: LONGTEXT");
    console.log("  - surveyTitle: VARCHAR(255)");
    console.log("  - category: VARCHAR(255)");
    console.log("  - status: ENUM");
    console.log("  - generatedAt: DATETIME");
    console.log("  - createdAt: DATETIME");
    console.log("  - updatedAt: DATETIME");

    process.exit(0);
  } catch (error) {
    console.error("❌ 创建 reports 表失败:", error);
    process.exit(1);
  }
}

createReportsTableManual();
