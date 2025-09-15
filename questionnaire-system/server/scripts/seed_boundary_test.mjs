// server/scripts/seed_boundary_test.mjs
// 边界测试数据生成脚本 - 专门测试极端情况和边界条件
// 用法：在 server 目录运行 node scripts/seed_boundary_test.mjs

import bcrypt from "bcryptjs";
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

console.log("🧪 开始生成边界测试数据...");

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

// 建立关联
Questionnaire.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Questionnaire.belongsTo(Category, { foreignKey: "categoryId" });
Question.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Answer.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Answer.belongsTo(User, { foreignKey: "userId" });
Favorite.belongsTo(User, { foreignKey: "userId" });
Favorite.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Achievement.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });
Report.belongsTo(User, { foreignKey: "userId" });
Report.belongsTo(Questionnaire, { foreignKey: "questionnaireId" });

async function seedBoundaryTest() {
  try {
    console.log("📦 同步数据库表结构...");
    await sequelize.sync({ alter: true });

    // 获取现有数据
    const existingUsers = await User.findAll();
    const existingCategories = await Category.findAll();

    if (existingUsers.length === 0 || existingCategories.length === 0) {
      console.log("❌ 请先运行基础 seed 脚本");
      return;
    }

    const admin = existingUsers.find((u) => u.role === "admin");
    const normalUsers = existingUsers.filter((u) => u.role === "user");

    // 1. 边界测试用户
    console.log("👥 创建边界测试用户...");

    const boundaryUsers = [
      {
        email: "boundary_empty_nick@test.com",
        password: "test123",
        nickname: "", // 空昵称
        role: "user",
        banned: false,
      },
      {
        email: "boundary_long_nick@test.com",
        password: "test123",
        nickname:
          "超级无敌霹雳长昵称测试用户专门用来测试系统对超长昵称的处理能力和显示效果看看会不会出现布局问题或者截断问题", // 超长昵称
        role: "user",
        banned: false,
      },
      {
        email: "boundary_special_chars@test.com",
        password: "test123",
        nickname: "特殊字符©®™№§¶※〒〓〡", // 特殊字符昵称
        role: "user",
        banned: false,
      },
      {
        email: "boundary_emoji@test.com",
        password: "test123",
        nickname: "🚀💡🎯🔥⭐🌟💎🎨🎪🎭", // emoji昵称
        role: "user",
        banned: false,
      },
    ];

    const createdBoundaryUsers = [];
    for (const userData of boundaryUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          passwordHash: hashedPassword,
          nickname: userData.nickname,
          role: userData.role,
          banned: userData.banned,
        },
      });
      createdBoundaryUsers.push(user);
    }

    console.log(`✅ 创建了 ${createdBoundaryUsers.length} 个边界测试用户`);

    // 2. 边界测试分类
    console.log("📂 创建边界测试分类...");

    const boundaryCategories = [
      {
        name: "", // 空名称测试
        description: "空名称分类测试",
      },
      {
        name: "超长分类名称测试专用分类这个名称非常长用来测试系统对超长分类名称的处理能力和显示效果",
        description: "超长名称分类测试",
      },
      {
        name: "特殊字符分类©®™",
        description:
          "包含特殊字符的分类测试用例，用于验证系统对各种Unicode字符的支持情况，包括但不限于版权符号©、注册商标®、商标™等特殊符号的处理能力",
      },
      {
        name: "Emoji分类🎯🚀💡",
        description:
          "包含emoji表情的分类测试🌟⭐🔥💎🎨🎪🎭🎬🎤🎧🎵🎶🎸🥁🎺🎻🎹",
      },
    ];

    const createdBoundaryCategories = [];
    for (const catData of boundaryCategories) {
      const [category] = await Category.findOrCreate({
        where: { name: catData.name || "空名称分类" }, // 处理空名称
        defaults: {
          name: catData.name || "空名称分类",
          description: catData.description,
        },
      });
      createdBoundaryCategories.push(category);
    }

    console.log(`✅ 创建了 ${createdBoundaryCategories.length} 个边界测试分类`);

    // 3. 边界测试问卷
    console.log("📝 创建边界测试问卷...");

    const boundaryQuestionnaires = [
      // 空标题问卷
      {
        title: "",
        description: "空标题问卷测试",
        status: "draft",
        creatorId: admin.id,
        categoryId: existingCategories[0].id,
      },
      // 超长标题问卷
      {
        title:
          "超级无敌霹雳长标题问卷测试专用问卷这个标题非常非常非常长用来测试系统对超长标题的处理和显示能力看看前端界面会不会因为标题太长而出现布局问题或者文字溢出问题同时也测试数据库字段的长度限制和存储能力",
        description: "超长标题问卷测试用例",
        status: "published",
        creatorId: admin.id,
        categoryId: existingCategories[0].id,
      },
      // 超长描述问卷
      {
        title: "超长描述测试问卷",
        description:
          "这是一个超级超级超级长的问卷描述，".repeat(100) +
          "用于测试系统对超长描述文本的处理能力。",
        status: "published",
        creatorId: admin.id,
        categoryId: existingCategories[0].id,
      },
      // 特殊字符问卷
      {
        title: "特殊字符测试问卷©®™№§",
        description:
          "包含各种特殊字符的问卷：©®™№§¶※〒〓〡〢〣〤〥〦〧〨〩㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩㊀㊁㊂㊃",
        status: "published",
        creatorId: admin.id,
        categoryId: existingCategories[0].id,
      },
      // Emoji问卷
      {
        title: "Emoji测试问卷🎯🚀💡⭐🔥",
        description:
          "包含emoji的问卷测试🌟💎🎨🎪🎭🎬🎤🎧🎵🎶🎸🥁🎺🎻🎹🎼🎪🎨🖌️🖍️🖊️✏️📝📄📃📑📊📈📉",
        status: "published",
        creatorId: admin.id,
        categoryId: existingCategories[0].id,
      },
      // 极大量题目问卷
      {
        title: "大量题目压力测试问卷",
        description: "包含大量题目的问卷，用于测试系统性能",
        status: "published",
        creatorId: admin.id,
        categoryId: existingCategories[0].id,
      },
    ];

    const createdBoundaryQuestionnaires = [];
    for (const qData of boundaryQuestionnaires) {
      const [questionnaire] = await Questionnaire.findOrCreate({
        where: { title: qData.title || "空标题问卷" },
        defaults: {
          title: qData.title || "空标题问卷",
          description: qData.description,
          status: qData.status,
          creatorId: qData.creatorId,
          categoryId: qData.categoryId,
        },
      });
      createdBoundaryQuestionnaires.push(questionnaire);
    }

    console.log(
      `✅ 创建了 ${createdBoundaryQuestionnaires.length} 个边界测试问卷`
    );

    // 4. 边界测试题目
    console.log("❓ 创建边界测试题目...");

    // 找到需要添加题目的问卷
    const largeQuestionnaireTitle = "大量题目压力测试问卷";
    const largeQuestionnaire = createdBoundaryQuestionnaires.find(
      (q) => q.title === largeQuestionnaireTitle
    );

    if (largeQuestionnaire) {
      // 为大量题目问卷添加100道题
      for (let i = 1; i <= 100; i++) {
        await Question.create({
          questionnaireId: largeQuestionnaire.id,
          content: `第${i}道题目：这是压力测试题目${i}，用于测试系统处理大量题目的能力`,
          type: i % 3 === 0 ? "text" : i % 2 === 0 ? "multiple" : "single",
          options:
            i % 3 === 0
              ? null
              : [`选项A${i}`, `选项B${i}`, `选项C${i}`, `选项D${i}`],
          order: i,
        });
      }
    }

    // 为其他边界问卷添加特殊题目
    const specialQuestionnaire = createdBoundaryQuestionnaires.find((q) =>
      q.title.includes("特殊字符")
    );

    if (specialQuestionnaire) {
      const specialQuestions = [
        {
          content: "", // 空题目内容
          type: "single",
          options: ["选项1", "选项2"],
          order: 1,
        },
        {
          content: "超长题目内容测试".repeat(50),
          type: "single",
          options: ["选项1", "选项2"],
          order: 2,
        },
        {
          content: "特殊字符题目©®™№§¶※〒",
          type: "multiple",
          options: ["选项A©", "选项B®", "选项C™", "选项D§"],
          order: 3,
        },
        {
          content: "Emoji题目🎯🚀💡⭐",
          type: "single",
          options: ["🎯选项1", "🚀选项2", "💡选项3", "⭐选项4"],
          order: 4,
        },
        {
          content: "超长选项测试题目",
          type: "multiple",
          options: [
            "超长选项测试".repeat(20),
            "正常选项",
            "", // 空选项
            "特殊字符选项©®™",
          ],
          order: 5,
        },
        {
          content: "大量选项测试题目",
          type: "multiple",
          options: Array.from({ length: 50 }, (_, i) => `选项${i + 1}`), // 50个选项
          order: 6,
        },
      ];

      for (const question of specialQuestions) {
        await Question.create({
          questionnaireId: specialQuestionnaire.id,
          ...question,
        });
      }
    }

    console.log("✅ 创建了边界测试题目");

    // 5. 边界测试答卷数据
    console.log("📋 创建边界测试答卷...");

    const allUsers = [...existingUsers, ...createdBoundaryUsers];
    const publishedBoundaryQuestionnaires =
      createdBoundaryQuestionnaires.filter((q) => q.status === "published");

    for (const questionnaire of publishedBoundaryQuestionnaires) {
      const questions = await Question.findAll({
        where: { questionnaireId: questionnaire.id },
      });

      if (questions.length === 0) continue;

      // 创建各种极端答案的答卷
      const boundaryAnswers = [
        // 空答案
        {
          userId: normalUsers[0]?.id,
          answers: questions.map((q) => ({ questionId: q.id, value: "" })),
          score: 0,
        },
        // 超长答案
        {
          userId: normalUsers[1]?.id,
          answers: questions.map((q) => ({
            questionId: q.id,
            value:
              q.type === "text"
                ? "超长回答".repeat(1000)
                : q.options
                ? q.options[0]
                : "默认",
          })),
          score: 100,
        },
        // 特殊字符答案
        {
          userId: normalUsers[2]?.id,
          answers: questions.map((q) => ({
            questionId: q.id,
            value:
              q.type === "text"
                ? "特殊字符©®™№§¶※〒〓"
                : q.options
                ? q.options[0]
                : "默认",
          })),
          score: 85,
        },
        // 不存在的选项答案（边界测试）
        {
          userId: normalUsers[3]?.id,
          answers: questions.map((q) => ({
            questionId: q.id,
            value: "不存在的选项",
          })),
          score: 50,
        },
      ];

      for (const answerData of boundaryAnswers) {
        if (!answerData.userId) continue;

        await Answer.create({
          questionnaireId: questionnaire.id,
          userId: answerData.userId,
          detail: {
            answers: answerData.answers,
            submitTime: new Date(),
            score: answerData.score,
            testType: "boundary_test",
          },
        }).catch(() => {}); // 忽略错误
      }
    }

    console.log("✅ 创建了边界测试答卷");

    // 6. 极端评论数据
    console.log("💬 创建边界测试评论...");

    const boundaryComments = [
      {
        rating: 0, // 边界评分
        content: "",
      },
      {
        rating: 6, // 超出范围评分
        content: "超出范围评分测试",
      },
      {
        rating: 5,
        content:
          "超长评论测试：" + "这是一个非常非常长的评论内容，".repeat(500),
      },
      {
        rating: 5,
        content: "特殊字符评论©®™№§¶※〒〓〡〢〣〤〥",
      },
      {
        rating: 5,
        content: "Emoji评论🎯🚀💡⭐🔥🌟💎🎨🎪🎭",
      },
      {
        rating: null, // null评分
        content: "null评分测试",
      },
    ];

    for (const questionnaire of publishedBoundaryQuestionnaires.slice(0, 3)) {
      for (const commentData of boundaryComments) {
        const user = allUsers[Math.floor(Math.random() * allUsers.length)];

        await Comment.create({
          userId: user.id,
          questionnaireId: questionnaire.id,
          rating: commentData.rating,
          content: commentData.content,
        }).catch(() => {}); // 忽略错误
      }
    }

    console.log("✅ 创建了边界测试评论");

    // 7. 极端成就数据
    console.log("🏆 创建边界成就数据...");

    const boundaryAchievements = [
      {
        points: 0, // 最小积分
        badges: [],
      },
      {
        points: 99999, // 极大积分（调整到合理范围）
        badges: ["超级用户"],
      },
      {
        points: 1,
        badges: ["超长徽章名称测试超长徽章名称测试超长徽章名称测试"], // 超长徽章名
      },
      {
        points: 100,
        badges: ["特殊字符徽章©®™", "Emoji徽章🏆⭐💎"], // 特殊字符徽章
      },
      {
        points: 500,
        badges: Array.from({ length: 50 }, (_, i) => `徽章${i + 1}`), // 大量徽章（减少数量）
      },
    ];

    for (
      let i = 0;
      i < Math.min(boundaryAchievements.length, createdBoundaryUsers.length);
      i++
    ) {
      await Achievement.findOrCreate({
        where: { userId: createdBoundaryUsers[i].id },
        defaults: boundaryAchievements[i],
      });
    }

    console.log("✅ 创建了边界成就数据");

    // 8. 统计结果
    console.log("\n🧪 边界测试数据生成完成！");
    console.log("\n📋 边界测试数据统计：");
    console.log(`- 边界测试用户: ${createdBoundaryUsers.length} 个`);
    console.log(`- 边界测试分类: ${createdBoundaryCategories.length} 个`);
    console.log(`- 边界测试问卷: ${createdBoundaryQuestionnaires.length} 个`);
    console.log(`- 大量题目问卷: 包含100道题`);
    console.log(`- 边界测试答卷: 多种极端答案情况`);
    console.log(`- 边界测试评论: 各种评分和内容边界`);

    console.log("\n🔍 测试场景覆盖：");
    console.log("- 空值和null测试");
    console.log("- 超长内容测试");
    console.log("- 特殊字符和Unicode测试");
    console.log("- Emoji表情测试");
    console.log("- 大量数据压力测试");
    console.log("- 边界数值测试");
    console.log("- 不合法数据测试");
  } catch (error) {
    console.error("❌ 边界测试数据生成出错:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行边界测试数据生成
seedBoundaryTest()
  .then(() => {
    console.log("\n✅ 边界测试数据脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 边界测试数据脚本执行失败:", error);
    process.exit(1);
  });
