/**
 * 数据库清理脚本 - 删除Survey表中的重复字段
 *
 * 需要删除的重复字段:
 * - authorId (使用userId代替)
 * - authorName (使用creator关联获取)
 * - author (使用creator关联获取)
 * - creatorId (使用userId代替)
 *
 * 运行方式: node migrations/cleanup-duplicate-fields.js
 */

const sequelize = require("../config/database");

async function cleanupDuplicateFields() {
  try {
    console.log("🔧 开始清理Survey表的重复字段...\n");

    // 连接数据库
    await sequelize.authenticate();
    console.log("✅ 数据库连接成功\n");

    // 检查并删除重复字段
    const fieldsToRemove = ["authorId", "authorName", "author", "creatorId"];

    for (const field of fieldsToRemove) {
      try {
        // 检查字段是否存在
        const [results] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'surveys' 
          AND COLUMN_NAME = '${field}'
        `);

        if (results.length > 0) {
          console.log(`📝 删除字段: ${field}`);
          await sequelize.query(`ALTER TABLE surveys DROP COLUMN ${field}`);
          console.log(`✅ 字段 ${field} 已删除\n`);
        } else {
          console.log(`ℹ️  字段 ${field} 不存在,跳过\n`);
        }
      } catch (error) {
        console.error(`❌ 删除字段 ${field} 失败:`, error.message);
      }
    }

    console.log("✅ 清理完成!\n");
    console.log("📊 当前Survey表使用的字段:");
    console.log("   - userId: 创建者ID (关联User表)");
    console.log("   - categoryId: 分类ID (关联Category表)");
    console.log("   - 通过关联查询获取creator和categoryInfo信息\n");
  } catch (error) {
    console.error("❌ 清理失败:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 数据库连接已关闭");
  }
}

// 运行清理
cleanupDuplicateFields();
