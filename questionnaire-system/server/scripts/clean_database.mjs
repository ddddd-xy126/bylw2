// server/scripts/clean_database.mjs
// 数据库清理脚本 - 清空所有表数据但保留表结构
// 用法：在 server 目录运行 node scripts/clean_database.mjs

import { Sequelize } from "sequelize";
import config from "../config/config.default.js";

// 导入模型工厂
import userModelFactory from "../models/user.js";
import categoryModelFactory from "../models/category.js";
import questionnaireModelFactory from "../models/questionnaire.js";
import questionModelFactory from "../models/question.js";
import favoriteModelFactory from "../models/favorite.js";
import answerModelFactory from "../models/answer.js";
import achievementModelFactory from "../models/achievement.js";
import commentModelFactory from "../models/comment.js";
import reportModelFactory from "../models/report.js";

console.log("🧹 开始清理数据库...");

// 初始化数据库连接
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    logging: false,
  }
);

// 初始化模型
const User = userModelFactory(sequelize);
const Category = categoryModelFactory(sequelize);
const Questionnaire = questionnaireModelFactory(sequelize);
const Question = questionModelFactory(sequelize);
const Favorite = favoriteModelFactory(sequelize);
const Answer = answerModelFactory(sequelize);
const Achievement = achievementModelFactory(sequelize);
const Comment = commentModelFactory(sequelize);
const Report = reportModelFactory(sequelize);

async function cleanDatabase() {
  try {
    console.log("📊 获取清理前数据统计...");

    const beforeStats = {
      users: await User.count(),
      categories: await Category.count(),
      questionnaires: await Questionnaire.count(),
      questions: await Question.count(),
      favorites: await Favorite.count(),
      answers: await Answer.count(),
      achievements: await Achievement.count(),
      comments: await Comment.count(),
      reports: await Report.count(),
    };

    console.log("清理前数据统计:");
    Object.entries(beforeStats).forEach(([key, value]) => {
      console.log(`- ${key}: ${value} 条`);
    });

    console.log("\n🗑️ 开始清理数据...");

    // 按照依赖关系顺序清理（先清理有外键依赖的表）
    console.log("清理 Reports...");
    await Report.destroy({ where: {}, truncate: true });

    console.log("清理 Comments...");
    await Comment.destroy({ where: {}, truncate: true });

    console.log("清理 Achievements...");
    await Achievement.destroy({ where: {}, truncate: true });

    console.log("清理 Answers...");
    await Answer.destroy({ where: {}, truncate: true });

    console.log("清理 Favorites...");
    await Favorite.destroy({ where: {}, truncate: true });

    console.log("清理 Questions...");
    await Question.destroy({ where: {}, truncate: true });

    console.log("清理 Questionnaires...");
    await Questionnaire.destroy({ where: {}, truncate: true });

    console.log("清理 Users...");
    await User.destroy({ where: {}, truncate: true });

    console.log("清理 Categories...");
    await Category.destroy({ where: {}, truncate: true });

    // 重置自增ID（MySQL特定）
    console.log("\n🔄 重置自增ID...");
    const tables = [
      "users",
      "categories",
      "questionnaires",
      "questions",
      "favorites",
      "answers",
      "achievements",
      "comments",
      "reports",
    ];

    for (const table of tables) {
      try {
        await sequelize.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      } catch (error) {
        console.log(`重置 ${table} 自增ID 失败:`, error.message);
      }
    }

    console.log("\n📊 获取清理后数据统计...");

    const afterStats = {
      users: await User.count(),
      categories: await Category.count(),
      questionnaires: await Questionnaire.count(),
      questions: await Question.count(),
      favorites: await Favorite.count(),
      answers: await Answer.count(),
      achievements: await Achievement.count(),
      comments: await Comment.count(),
      reports: await Report.count(),
    };

    console.log("清理后数据统计:");
    Object.entries(afterStats).forEach(([key, value]) => {
      console.log(`- ${key}: ${value} 条`);
    });

    const totalBefore = Object.values(beforeStats).reduce(
      (sum, val) => sum + val,
      0
    );
    const totalAfter = Object.values(afterStats).reduce(
      (sum, val) => sum + val,
      0
    );

    console.log(`\n✅ 数据库清理完成！`);
    console.log(`📊 总计: ${totalBefore} → ${totalAfter} 条记录`);
    console.log(`🗑️ 清理了 ${totalBefore - totalAfter} 条记录`);

    if (totalAfter === 0) {
      console.log("\n🎉 数据库已完全清空，可以重新运行 seed 脚本！");
      console.log("💡 建议执行顺序:");
      console.log("1. node scripts/seed_data.mjs (基础数据)");
      console.log("2. node scripts/seed_extended_data.mjs (扩展数据)");
      console.log("3. node scripts/seed_boundary_test.mjs (边界测试数据)");
    } else {
      console.log("⚠️ 某些数据可能未完全清理，请检查外键约束");
    }
  } catch (error) {
    console.error("❌ 数据库清理过程出错:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行清理
cleanDatabase()
  .then(() => {
    console.log("\n✅ 数据库清理脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 数据库清理脚本执行失败:", error);
    process.exit(1);
  });
