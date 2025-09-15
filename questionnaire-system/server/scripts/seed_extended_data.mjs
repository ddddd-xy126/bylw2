// server/scripts/seed_extended_data.mjs
// 扩展的测试数据生成脚本 - 添加更多特定类型的测试数据
// 用法：在 server 目录运行 node scripts/seed_extended_data.mjs

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

console.log("🌱 开始生成扩展测试数据...");

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

// 工具函数
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices(array, count = null) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(
    0,
    count || Math.floor(Math.random() * array.length) + 1
  );
}

async function seedExtendedData() {
  try {
    console.log("📦 同步数据库表结构...");
    await sequelize.sync({ alter: true });

    // 获取现有的数据作为基础
    const existingUsers = await User.findAll();
    const existingCategories = await Category.findAll();
    const existingQuestionnaires = await Questionnaire.findAll();

    if (existingUsers.length === 0 || existingCategories.length === 0) {
      console.log("❌ 请先运行基础 seed 脚本: node scripts/seed_data.mjs");
      return;
    }

    console.log(
      `✅ 找到现有数据: ${existingUsers.length}个用户, ${existingCategories.length}个分类, ${existingQuestionnaires.length}个问卷`
    );

    // 1. 创建更多特定类型的分类
    console.log("📂 创建更多专业分类...");

    const categories = [
      { name: "人工智能", description: "AI相关技术和应用测试" },
      { name: "数据科学", description: "数据分析和机器学习能力评估" },
      { name: "网络安全", description: "信息安全知识和技能测试" },
      { name: "项目管理", description: "项目管理能力和经验评估" },
      { name: "用户体验", description: "UX/UI设计理念和实践测试" },
      { name: "金融理财", description: "财务管理和投资理念评估" },
      { name: "职业规划", description: "职业发展和规划指导测试" },
      { name: "团队协作", description: "团队合作和沟通能力评估" },
      { name: "创业创新", description: "创业思维和创新能力测试" },
      { name: "生活品质", description: "生活质量和幸福感评估" },
    ];

    const createdCategories = {};
    for (const cat of categories) {
      const [category] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: { description: cat.description },
      });
      createdCategories[cat.name] = category;
    }

    console.log(`✅ 创建了 ${categories.length} 个专业分类`);

    // 2. 创建批量测试用户（用于性能测试）
    console.log("👥 创建批量测试用户...");

    const batchUsers = [];
    for (let i = 1; i <= 50; i++) {
      const password = await bcrypt.hash(`test${i}123`, 10);
      const [user] = await User.findOrCreate({
        where: { email: `test${i}@example.com` },
        defaults: {
          passwordHash: password,
          nickname: `TestUser${i}`,
          role: "user",
          banned: i % 20 === 0, // 每20个用户中有1个被封禁
        },
      });
      batchUsers.push(user);
    }

    // 创建一些VIP用户
    const vipUsers = [];
    for (let i = 1; i <= 5; i++) {
      const password = await bcrypt.hash(`vip${i}123`, 10);
      const [user] = await User.findOrCreate({
        where: { email: `vip${i}@example.com` },
        defaults: {
          passwordHash: password,
          nickname: `VIPUser${i}`,
          role: "user",
          banned: false,
        },
      });
      vipUsers.push(user);
    }

    console.log(`✅ 创建了 ${batchUsers.length + vipUsers.length} 个测试用户`);

    // 3. 创建各种类型和状态的问卷
    console.log("📝 创建多样化问卷...");

    const allUsers = [...existingUsers, ...batchUsers, ...vipUsers];
    const allCategories = [
      ...existingCategories,
      ...Object.values(createdCategories),
    ];
    const admin = existingUsers.find((u) => u.role === "admin");

    const questionnaires = [
      // AI相关问卷
      {
        title: "人工智能认知水平测试",
        description: "评估您对人工智能技术的了解程度和应用能力",
        status: "published",
        creatorId: admin.id,
        categoryId: createdCategories["人工智能"].id,
        questions: [
          {
            content: "您认为以下哪个最能代表人工智能的核心？",
            type: "single",
            options: [
              "机器学习",
              "深度学习",
              "神经网络",
              "算法优化",
              "数据处理",
            ],
            order: 1,
          },
          {
            content: "您使用过哪些AI工具？（可多选）",
            type: "multiple",
            options: [
              "ChatGPT",
              "Midjourney",
              "GitHub Copilot",
              "TensorFlow",
              "PyTorch",
              "OpenCV",
            ],
            order: 2,
          },
          {
            content: "请描述您对AGI（通用人工智能）的理解：",
            type: "text",
            options: null,
            order: 3,
          },
        ],
      },
      // 数据科学问卷
      {
        title: "数据科学技能全面评估",
        description: "从统计学基础到机器学习实战的全方位评估",
        status: "published",
        creatorId: admin.id,
        categoryId: createdCategories["数据科学"].id,
        questions: [
          {
            content: "您最擅长使用哪种数据分析工具？",
            type: "single",
            options: ["Python", "R", "SQL", "Excel", "Tableau", "Power BI"],
            order: 1,
          },
          {
            content: "以下哪些机器学习算法您有实际应用经验？（可多选）",
            type: "multiple",
            options: [
              "线性回归",
              "逻辑回归",
              "随机森林",
              "SVM",
              "神经网络",
              "聚类算法",
              "深度学习",
            ],
            order: 2,
          },
        ],
      },
      // 网络安全问卷
      {
        title: "网络安全意识和技能评估",
        description: "测试您的网络安全知识和防护意识",
        status: "published",
        creatorId: randomChoice(allUsers).id,
        categoryId: createdCategories["网络安全"].id,
        questions: [
          {
            content: "以下哪种做法最能保护您的密码安全？",
            type: "single",
            options: [
              "使用复杂密码",
              "定期更换密码",
              "使用密码管理器",
              "启用双因子认证",
              "以上都是",
            ],
            order: 1,
          },
          {
            content: "您了解哪些网络攻击类型？（可多选）",
            type: "multiple",
            options: [
              "钓鱼攻击",
              "DDoS攻击",
              "SQL注入",
              "XSS攻击",
              "中间人攻击",
              "社会工程学",
            ],
            order: 2,
          },
        ],
      },
      // 项目管理问卷
      {
        title: "敏捷项目管理能力评估",
        description: "评估您在敏捷开发和项目管理方面的经验和能力",
        status: "published",
        creatorId: randomChoice(allUsers).id,
        categoryId: createdCategories["项目管理"].id,
        questions: [
          {
            content: "您最熟悉哪种项目管理方法论？",
            type: "single",
            options: [
              "Scrum",
              "Kanban",
              "瀑布模型",
              "极限编程(XP)",
              "混合方法",
            ],
            order: 1,
          },
          {
            content: "在项目管理中，您认为最重要的技能是什么？",
            type: "text",
            options: null,
            order: 2,
          },
        ],
      },
      // 边界测试用例 - 超长问卷
      {
        title:
          "全面综合能力评估超级问卷测试标题这里故意写得很长来测试系统对长标题的处理能力和显示效果",
        description:
          "这是一个用于测试系统边界情况的超长描述问卷，包含各种极端情况的测试用例，用于验证系统在处理异常数据时的稳定性和容错能力，同时也测试前端界面对超长文本的显示和处理能力，确保用户体验不会因为数据异常而受到影响。这个描述故意写得很长，就是为了测试系统的边界处理能力。",
        status: "draft",
        creatorId: randomChoice(allUsers).id,
        categoryId: randomChoice(allCategories).id,
        questions: [],
      },
      // 空问卷测试
      {
        title: "空问卷测试",
        description: "用于测试没有题目的问卷处理",
        status: "draft",
        creatorId: randomChoice(allUsers).id,
        categoryId: randomChoice(allCategories).id,
        questions: [],
      },
      // 单题问卷
      {
        title: "极简单题问卷",
        description: "只有一个问题的问卷测试",
        status: "published",
        creatorId: randomChoice(allUsers).id,
        categoryId: randomChoice(allCategories).id,
        questions: [
          {
            content: "您对我们的服务满意吗？",
            type: "single",
            options: ["满意", "不满意"],
            order: 1,
          },
        ],
      },
      // 职业规划问卷
      {
        title: "IT行业职业发展规划评估",
        description: "帮助IT从业者规划职业发展路径",
        status: "published",
        creatorId: randomChoice(vipUsers).id,
        categoryId: createdCategories["职业规划"].id,
        questions: [
          {
            content: "您目前处于职业发展的哪个阶段？",
            type: "single",
            options: [
              "初级工程师",
              "中级工程师",
              "高级工程师",
              "技术专家",
              "技术管理",
              "高级管理",
            ],
            order: 1,
          },
          {
            content: "您希望在哪些方向发展？（可多选）",
            type: "multiple",
            options: [
              "技术深度",
              "技术广度",
              "团队管理",
              "产品设计",
              "架构设计",
              "创业",
            ],
            order: 2,
          },
          {
            content: "您认为阻碍您职业发展的主要因素是什么？",
            type: "text",
            options: null,
            order: 3,
          },
        ],
      },
    ];

    const createdQuestionnaires = [];
    for (const q of questionnaires) {
      const [questionnaire] = await Questionnaire.findOrCreate({
        where: { title: q.title },
        defaults: {
          description: q.description,
          status: q.status,
          creatorId: q.creatorId,
          categoryId: q.categoryId,
        },
      });
      createdQuestionnaires.push(questionnaire);

      // 创建题目
      for (const question of q.questions) {
        await Question.findOrCreate({
          where: {
            questionnaireId: questionnaire.id,
            content: question.content,
          },
          defaults: {
            type: question.type,
            options: question.options,
            order: question.order,
          },
        });
      }
    }

    console.log(`✅ 创建了 ${createdQuestionnaires.length} 个多样化问卷`);

    // 4. 生成大量收藏数据（性能测试）
    console.log("⭐ 生成批量收藏数据...");

    const allQuestionnaires = [
      ...existingQuestionnaires,
      ...createdQuestionnaires,
    ];
    const favoriteCount = Math.min(
      1000,
      allUsers.length * allQuestionnaires.length * 0.3
    ); // 30%的收藏率

    for (let i = 0; i < favoriteCount; i++) {
      const user = randomChoice(allUsers);
      const questionnaire = randomChoice(allQuestionnaires);

      await Favorite.findOrCreate({
        where: {
          userId: user.id,
          questionnaireId: questionnaire.id,
        },
      }).catch(() => {}); // 忽略重复数据错误
    }

    console.log(`✅ 生成了约 ${favoriteCount} 条收藏记录`);

    // 5. 生成大量答卷数据（包含各种边界情况）
    console.log("📋 生成多样化答卷数据...");

    const publishedQuestionnaires = allQuestionnaires.filter(
      (q) => q.status === "published"
    );
    const answerData = [];

    // 为每个用户生成随机数量的答卷
    for (const user of allUsers) {
      const numAnswers = Math.floor(Math.random() * 10) + 1; // 1-10份答卷
      const selectedQuestionnaires = randomChoices(
        publishedQuestionnaires,
        numAnswers
      );

      for (const questionnaire of selectedQuestionnaires) {
        const questions = await Question.findAll({
          where: { questionnaireId: questionnaire.id },
        });

        if (questions.length === 0) continue;

        const answers = [];
        let score = Math.floor(Math.random() * 41) + 60; // 60-100分

        for (const question of questions) {
          let value;
          switch (question.type) {
            case "single":
              value = question.options
                ? randomChoice(question.options)
                : "默认答案";
              break;
            case "multiple":
              value = question.options
                ? randomChoices(question.options)
                : ["默认答案"];
              break;
            case "text":
              const textAnswers = [
                "这是一个详细的文本回答，包含了我的真实想法和经验分享。",
                "经过深入思考，我认为这个问题涉及多个方面...",
                "基于我的实际经验，我想分享以下观点：首先...",
                "这是一个很有意思的问题，让我想到了...",
                "从技术角度来看，我觉得需要考虑以下几个因素...",
                "简短回答",
                "", // 空答案测试
                "超级长的回答".repeat(100), // 超长答案测试
              ];
              value = randomChoice(textAnswers);
              break;
            default:
              value = "默认答案";
          }
          answers.push({ questionId: question.id, value });
        }

        const answerRecord = {
          questionnaireId: questionnaire.id,
          userId: user.id,
          detail: {
            answers,
            submitTime: randomDate(new Date(2024, 0, 1), new Date()),
            score,
            deviceInfo: {
              browser: randomChoice(["Chrome", "Firefox", "Safari", "Edge"]),
              os: randomChoice(["Windows", "macOS", "Linux", "Android", "iOS"]),
              mobile: Math.random() > 0.7,
            },
          },
        };

        answerData.push(answerRecord);
      }
    }

    // 批量插入答卷数据
    for (const answer of answerData.slice(0, 500)) {
      // 限制为500份，避免太大
      await Answer.create(answer).catch(() => {}); // 忽略重复错误
    }

    console.log(`✅ 生成了约 ${Math.min(answerData.length, 500)} 份答卷记录`);

    // 6. 生成多样化成就数据
    console.log("🏆 生成成就系统数据...");

    const achievementTemplates = [
      { points: 0, badges: [] }, // 新用户
      { points: 50, badges: ["新手"] },
      { points: 150, badges: ["新手", "完成者"] },
      { points: 300, badges: ["新手", "完成者", "活跃用户"] },
      { points: 500, badges: ["新手", "完成者", "活跃用户", "问卷达人"] },
      {
        points: 800,
        badges: ["新手", "完成者", "活跃用户", "问卷达人", "高分获得者"],
      },
      {
        points: 1200,
        badges: [
          "新手",
          "完成者",
          "活跃用户",
          "问卷达人",
          "高分获得者",
          "专家",
        ],
      },
      {
        points: 2000,
        badges: [
          "新手",
          "完成者",
          "活跃用户",
          "问卷达人",
          "高分获得者",
          "专家",
          "大师",
        ],
      },
    ];

    for (const user of allUsers) {
      const template = randomChoice(achievementTemplates);
      await Achievement.findOrCreate({
        where: { userId: user.id },
        defaults: {
          points: template.points + Math.floor(Math.random() * 100), // 添加随机浮动
          badges: template.badges,
        },
      });
    }

    console.log(`✅ 为 ${allUsers.length} 个用户生成了成就数据`);

    // 7. 生成多样化评论数据
    console.log("💬 生成评论和反馈数据...");

    const commentTemplates = [
      { rating: 5, content: "非常棒的问卷，题目设计很用心！" },
      { rating: 5, content: "很有启发性，帮助我更好地了解自己。" },
      { rating: 4, content: "整体不错，建议增加更多题目类型。" },
      { rating: 4, content: "问卷质量很高，结果分析很专业。" },
      { rating: 3, content: "还可以，但是有些题目不够清晰。" },
      { rating: 3, content: "一般般，题目有点重复。" },
      { rating: 2, content: "题目设计有待改进。" },
      { rating: 1, content: "问卷体验不好，题目逻辑有问题。" },
      { rating: 5, content: "" }, // 空评论测试
      {
        rating: 5,
        content: "超长评论测试：" + "这是一个非常详细的评论，".repeat(50),
      },
    ];

    // 为已发布的问卷生成评论
    for (const questionnaire of publishedQuestionnaires.slice(0, 20)) {
      // 限制数量
      const commentCount = Math.floor(Math.random() * 15) + 1; // 1-15条评论

      for (let i = 0; i < commentCount; i++) {
        const user = randomChoice(allUsers);
        const template = randomChoice(commentTemplates);

        await Comment.create({
          userId: user.id,
          questionnaireId: questionnaire.id,
          rating: template.rating,
          content: template.content,
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        }).catch(() => {}); // 忽略重复错误
      }
    }

    console.log("✅ 生成了大量评论数据");

    // 8. 生成多类型AI报告
    console.log("📊 生成AI分析报告...");

    const reportTypes = [
      "personality_analysis",
      "skill_assessment",
      "preference_analysis",
      "health_assessment",
      "stress_management",
      "learning_analysis",
      "usage_analysis",
      "career_guidance",
      "team_collaboration",
      "innovation_assessment",
    ];

    // 为有答卷的用户生成报告
    const answeredUsers = await Answer.findAll({
      attributes: ["userId", "questionnaireId"],
      group: ["userId", "questionnaireId"],
      include: [
        { model: User, attributes: ["id", "nickname"] },
        { model: Questionnaire, attributes: ["id", "title"] },
      ],
    });

    for (const answer of answeredUsers.slice(0, 100)) {
      // 限制数量
      const reportType = randomChoice(reportTypes);

      const reportContent = {
        summary: `基于您的答题结果生成的${reportType}分析报告。`,
        details: {
          analysis: "详细分析内容...",
          recommendations: ["建议1", "建议2", "建议3"],
          scores: {
            overall: Math.floor(Math.random() * 41) + 60,
            detail1: Math.floor(Math.random() * 41) + 60,
            detail2: Math.floor(Math.random() * 41) + 60,
          },
        },
      };

      const chartTypes = ["radar", "bar", "pie", "line"];
      const chartData = {
        type: randomChoice(chartTypes),
        data: {
          labels: ["维度1", "维度2", "维度3", "维度4", "维度5"],
          values: Array.from(
            { length: 5 },
            () => Math.floor(Math.random() * 41) + 60
          ),
        },
      };

      await Report.create({
        userId: answer.userId,
        questionnaireId: answer.questionnaireId,
        type: reportType,
        content: reportContent,
        chartData: chartData,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }).catch(() => {}); // 忽略重复错误
    }

    console.log("✅ 生成了AI分析报告");

    // 9. 统计最终数据
    console.log("\n🎉 扩展数据生成完成！");
    console.log("\n📋 最终数据统计：");
    console.log(`- 分类: ${await Category.count()} 个`);
    console.log(`- 用户: ${await User.count()} 个`);
    console.log(`- 问卷: ${await Questionnaire.count()} 个`);
    console.log(`- 题目: ${await Question.count()} 个`);
    console.log(`- 收藏: ${await Favorite.count()} 个`);
    console.log(`- 答卷: ${await Answer.count()} 个`);
    console.log(`- 成就: ${await Achievement.count()} 个`);
    console.log(`- 评论: ${await Comment.count()} 个`);
    console.log(`- 报告: ${await Report.count()} 个`);

    console.log("\n🔑 新增测试账号（批量）：");
    console.log(
      "批量用户: test1@example.com ~ test50@example.com / test1123 ~ test50123"
    );
    console.log(
      "VIP用户: vip1@example.com ~ vip5@example.com / vip1123 ~ vip5123"
    );
    console.log("注意: 每20个批量用户中有1个被封禁用于测试");
  } catch (error) {
    console.error("❌ 扩展数据生成过程出错:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行扩展数据生成
seedExtendedData()
  .then(() => {
    console.log("\n✅ 扩展数据脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 扩展数据脚本执行失败:", error);
    process.exit(1);
  });
