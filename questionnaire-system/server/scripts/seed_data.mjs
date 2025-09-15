// server/scripts/seed_data.mjs
// 用法：在 server 目录运行 node scripts/seed_data.mjs
// 会自动读取项目 DB 配置并插入示例数据

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

console.log("🌱 开始 seed 示例数据...");

// 初始化数据库连接
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    logging: false, // 减少输出
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

// 建立关联（需要在 sync 前）
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

async function seedData() {
  try {
    // 同步表结构（仅开发环境）
    console.log("📦 同步数据库表结构...");
    await sequelize.sync({ alter: true });

    // 1. 创建分类
    console.log("📂 创建分类...");
    const [psychologyCategory] = await Category.findOrCreate({
      where: { name: "心理测试" },
      defaults: { description: "心理健康和性格测试相关问卷" },
    });

    const [skillCategory] = await Category.findOrCreate({
      where: { name: "技能评估" },
      defaults: { description: "专业技能和能力评估问卷" },
    });

    const [healthCategory] = await Category.findOrCreate({
      where: { name: "健康评估" },
      defaults: { description: "身体健康和生活方式评估问卷" },
    });

    const [educationCategory] = await Category.findOrCreate({
      where: { name: "教育培训" },
      defaults: { description: "学习能力和教育效果评估问卷" },
    });

    const [entertainmentCategory] = await Category.findOrCreate({
      where: { name: "娱乐测试" },
      defaults: { description: "趣味性测试和娱乐问卷" },
    });

    const [marketCategory] = await Category.findOrCreate({
      where: { name: "市场调研" },
      defaults: { description: "产品和服务市场调研问卷" },
    });

    console.log(
      `✅ 分类创建完成: ${psychologyCategory.name}, ${skillCategory.name}, ${healthCategory.name}, ${educationCategory.name}, ${entertainmentCategory.name}, ${marketCategory.name}`
    );

    // 2. 创建用户（含管理员）
    console.log("👤 创建用户...");

    // 管理员
    const adminPwdHash = await bcrypt.hash("admin123", 10);
    const [admin] = await User.findOrCreate({
      where: { email: "admin@example.com" },
      defaults: {
        passwordHash: adminPwdHash,
        nickname: "SuperAdmin",
        role: "admin",
        banned: false,
      },
    });

    // 普通用户
    const userPwdHash = await bcrypt.hash("user123", 10);
    const [normalUser] = await User.findOrCreate({
      where: { email: "user@example.com" },
      defaults: {
        passwordHash: userPwdHash,
        nickname: "TestUser",
        role: "user",
        banned: false,
      },
    });

    const user2PwdHash = await bcrypt.hash("alice123", 10);
    const [alice] = await User.findOrCreate({
      where: { email: "alice@example.com" },
      defaults: {
        passwordHash: user2PwdHash,
        nickname: "Alice",
        role: "user",
        banned: false,
      },
    });

    // 添加更多测试用户
    const bobPwdHash = await bcrypt.hash("bob123", 10);
    const [bob] = await User.findOrCreate({
      where: { email: "bob@example.com" },
      defaults: {
        passwordHash: bobPwdHash,
        nickname: "Bob Wilson",
        role: "user",
        banned: false,
      },
    });

    const catherinePwdHash = await bcrypt.hash("catherine123", 10);
    const [catherine] = await User.findOrCreate({
      where: { email: "catherine@example.com" },
      defaults: {
        passwordHash: catherinePwdHash,
        nickname: "Catherine",
        role: "user",
        banned: false,
      },
    });

    const davidPwdHash = await bcrypt.hash("david123", 10);
    const [david] = await User.findOrCreate({
      where: { email: "david@example.com" },
      defaults: {
        passwordHash: davidPwdHash,
        nickname: "David Lee",
        role: "user",
        banned: false,
      },
    });

    // 创建一个被封禁的用户用于测试
    const bannedUserPwdHash = await bcrypt.hash("banned123", 10);
    const [bannedUser] = await User.findOrCreate({
      where: { email: "banned@example.com" },
      defaults: {
        passwordHash: bannedUserPwdHash,
        nickname: "BannedUser",
        role: "user",
        banned: true,
      },
    });

    console.log(
      `✅ 用户创建完成: ${admin.email}, ${normalUser.email}, ${alice.email}, ${bob.email}, ${catherine.email}, ${david.email}, ${bannedUser.email}`
    );

    // 3. 创建问卷
    console.log("📝 创建问卷...");

    const [questionnaire1] = await Questionnaire.findOrCreate({
      where: { title: "性格类型测试" },
      defaults: {
        description: "通过一系列问题了解您的性格特征和倾向",
        status: "published",
        creatorId: admin.id,
        categoryId: psychologyCategory.id,
      },
    });

    const [questionnaire2] = await Questionnaire.findOrCreate({
      where: { title: "编程技能评估" },
      defaults: {
        description: "评估您的编程基础知识和实践能力",
        status: "published",
        creatorId: admin.id,
        categoryId: skillCategory.id,
      },
    });

    const [questionnaire3] = await Questionnaire.findOrCreate({
      where: { title: "工作满意度调查" },
      defaults: {
        description: "了解员工对当前工作的满意程度",
        status: "draft",
        creatorId: normalUser.id,
        categoryId: psychologyCategory.id,
      },
    });

    // 添加更多问卷
    const [questionnaire4] = await Questionnaire.findOrCreate({
      where: { title: "健康生活方式评估" },
      defaults: {
        description: "评估您的日常生活习惯和健康状况",
        status: "published",
        creatorId: admin.id,
        categoryId: healthCategory.id,
      },
    });

    const [questionnaire5] = await Questionnaire.findOrCreate({
      where: { title: "学习方法测评" },
      defaults: {
        description: "了解您的学习习惯和方法偏好",
        status: "published",
        creatorId: alice.id,
        categoryId: educationCategory.id,
      },
    });

    const [questionnaire6] = await Questionnaire.findOrCreate({
      where: { title: "电影偏好调查" },
      defaults: {
        description: "了解您喜欢的电影类型和观影习惯",
        status: "published",
        creatorId: bob.id,
        categoryId: entertainmentCategory.id,
      },
    });

    const [questionnaire7] = await Questionnaire.findOrCreate({
      where: { title: "手机使用习惯调研" },
      defaults: {
        description: "调研用户的手机使用模式和应用偏好",
        status: "published",
        creatorId: admin.id,
        categoryId: marketCategory.id,
      },
    });

    const [questionnaire8] = await Questionnaire.findOrCreate({
      where: { title: "压力管理能力测试" },
      defaults: {
        description: "评估您在面对压力时的应对能力",
        status: "published",
        creatorId: catherine.id,
        categoryId: psychologyCategory.id,
      },
    });

    const [questionnaire9] = await Questionnaire.findOrCreate({
      where: { title: "前端框架技能调查" },
      defaults: {
        description: "调查开发者对各种前端框架的熟悉程度",
        status: "published",
        creatorId: david.id,
        categoryId: skillCategory.id,
      },
    });

    const [questionnaire10] = await Questionnaire.findOrCreate({
      where: { title: "产品体验满意度" },
      defaults: {
        description: "收集用户对我们产品的使用体验反馈",
        status: "draft",
        creatorId: admin.id,
        categoryId: marketCategory.id,
      },
    });

    console.log(
      `✅ 问卷创建完成: ${questionnaire1.title}, ${questionnaire2.title}, ${questionnaire3.title}, ${questionnaire4.title}, ${questionnaire5.title}, ${questionnaire6.title}, ${questionnaire7.title}, ${questionnaire8.title}, ${questionnaire9.title}, ${questionnaire10.title}`
    );

    // 4. 创建题目
    console.log("❓ 创建题目...");

    // 性格测试题目
    const [q1] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire1.id,
        content: "在社交场合中，您通常：",
      },
      defaults: {
        type: "single",
        options: [
          "主动与人交流",
          "等待别人先开口",
          "尽量避免交流",
          "视情况而定",
        ],
        order: 1,
      },
    });

    const [q2] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire1.id,
        content: "做决定时，您更依赖：",
      },
      defaults: {
        type: "single",
        options: ["逻辑分析", "直觉感受", "他人建议", "以往经验"],
        order: 2,
      },
    });

    // 编程技能题目
    const [q3] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire2.id,
        content: "以下哪些编程语言您比较熟悉？（可多选）",
      },
      defaults: {
        type: "multiple",
        options: ["JavaScript", "Python", "Java", "C++", "Go", "Rust"],
        order: 1,
      },
    });

    const [q4] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire2.id,
        content: "请简述您对面向对象编程的理解：",
      },
      defaults: {
        type: "text",
        options: null,
        order: 2,
      },
    });

    // 工作满意度题目
    const [q5] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire3.id,
        content: "您对当前工作的整体满意度：",
      },
      defaults: {
        type: "single",
        options: ["非常满意", "比较满意", "一般", "不太满意", "非常不满意"],
        order: 1,
      },
    });

    // 健康生活方式题目
    const [q6] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire4.id,
        content: "您平均每天的睡眠时间是：",
      },
      defaults: {
        type: "single",
        options: ["少于6小时", "6-7小时", "7-8小时", "8-9小时", "超过9小时"],
        order: 1,
      },
    });

    const [q7] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire4.id,
        content: "您平均每周运动多少次？",
      },
      defaults: {
        type: "single",
        options: ["从不运动", "1-2次", "3-4次", "5-6次", "每天都运动"],
        order: 2,
      },
    });

    const [q8] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire4.id,
        content: "以下哪些健康习惯您已经保持？（可多选）",
      },
      defaults: {
        type: "multiple",
        options: [
          "定时喝水",
          "均衡饮食",
          "规律作息",
          "定期体检",
          "戒烟戒酒",
          "心理调节",
        ],
        order: 3,
      },
    });

    // 学习方法题目
    const [q9] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire5.id,
        content: "您最喜欢的学习方式是：",
      },
      defaults: {
        type: "single",
        options: ["阅读书籍", "观看视频", "实践操作", "小组讨论", "在线课程"],
        order: 1,
      },
    });

    const [q10] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire5.id,
        content: "请描述您认为最有效的学习技巧：",
      },
      defaults: {
        type: "text",
        options: null,
        order: 2,
      },
    });

    // 电影偏好题目
    const [q11] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire6.id,
        content: "您最喜欢的电影类型是：（可多选）",
      },
      defaults: {
        type: "multiple",
        options: [
          "动作片",
          "喜剧片",
          "爱情片",
          "科幻片",
          "恐怖片",
          "悬疑片",
          "文艺片",
          "纪录片",
        ],
        order: 1,
      },
    });

    const [q12] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire6.id,
        content: "您通常在哪里观看电影？",
      },
      defaults: {
        type: "single",
        options: ["电影院", "家中电视", "电脑/平板", "手机", "投影仪"],
        order: 2,
      },
    });

    // 手机使用习惯题目
    const [q13] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire7.id,
        content: "您每天使用手机的时间大约是：",
      },
      defaults: {
        type: "single",
        options: ["1小时以内", "1-3小时", "3-5小时", "5-8小时", "超过8小时"],
        order: 1,
      },
    });

    const [q14] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire7.id,
        content: "您最常用的手机应用类型是：（可多选）",
      },
      defaults: {
        type: "multiple",
        options: [
          "社交媒体",
          "视频娱乐",
          "游戏",
          "购物",
          "新闻资讯",
          "学习教育",
          "工作办公",
          "生活服务",
        ],
        order: 2,
      },
    });

    // 压力管理题目
    const [q15] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire8.id,
        content: "面对压力时，您通常会：",
      },
      defaults: {
        type: "single",
        options: [
          "积极面对解决",
          "寻求他人帮助",
          "暂时逃避",
          "感到焦虑不安",
          "保持冷静分析",
        ],
        order: 1,
      },
    });

    const [q16] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire8.id,
        content: "以下哪些方法您用来缓解压力？（可多选）",
      },
      defaults: {
        type: "multiple",
        options: [
          "运动锻炼",
          "听音乐",
          "与朋友聊天",
          "冥想放松",
          "看书看电影",
          "旅行散心",
          "购物",
        ],
        order: 2,
      },
    });

    // 前端框架技能题目
    const [q17] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire9.id,
        content: "您使用过以下哪些前端框架？（可多选）",
      },
      defaults: {
        type: "multiple",
        options: [
          "React",
          "Vue",
          "Angular",
          "Svelte",
          "Next.js",
          "Nuxt.js",
          "Gatsby",
          "Ember",
        ],
        order: 1,
      },
    });

    const [q18] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire9.id,
        content: "请评价您对React的熟悉程度：",
      },
      defaults: {
        type: "single",
        options: [
          "完全不了解",
          "听说过但未使用",
          "基础使用",
          "熟练使用",
          "专家级别",
        ],
        order: 2,
      },
    });

    // 产品体验题目
    const [q19] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire10.id,
        content: "请为我们的产品整体体验打分：",
      },
      defaults: {
        type: "single",
        options: [
          "1分（很差）",
          "2分（较差）",
          "3分（一般）",
          "4分（较好）",
          "5分（很好）",
        ],
        order: 1,
      },
    });

    const [q20] = await Question.findOrCreate({
      where: {
        questionnaireId: questionnaire10.id,
        content: "您希望我们在哪些方面进行改进？",
      },
      defaults: {
        type: "text",
        options: null,
        order: 2,
      },
    });

    console.log(
      `✅ 题目创建完成: 共 ${
        [
          q1,
          q2,
          q3,
          q4,
          q5,
          q6,
          q7,
          q8,
          q9,
          q10,
          q11,
          q12,
          q13,
          q14,
          q15,
          q16,
          q17,
          q18,
          q19,
          q20,
        ].length
      } 道题`
    );

    // 5. 创建收藏
    console.log("⭐ 创建收藏记录...");

    await Favorite.findOrCreate({
      where: { userId: normalUser.id, questionnaireId: questionnaire1.id },
    });

    await Favorite.findOrCreate({
      where: { userId: alice.id, questionnaireId: questionnaire1.id },
    });

    await Favorite.findOrCreate({
      where: { userId: alice.id, questionnaireId: questionnaire2.id },
    });

    // 添加更多收藏记录
    await Favorite.findOrCreate({
      where: { userId: bob.id, questionnaireId: questionnaire6.id },
    });

    await Favorite.findOrCreate({
      where: { userId: catherine.id, questionnaireId: questionnaire4.id },
    });

    await Favorite.findOrCreate({
      where: { userId: catherine.id, questionnaireId: questionnaire8.id },
    });

    await Favorite.findOrCreate({
      where: { userId: david.id, questionnaireId: questionnaire2.id },
    });

    await Favorite.findOrCreate({
      where: { userId: david.id, questionnaireId: questionnaire9.id },
    });

    await Favorite.findOrCreate({
      where: { userId: normalUser.id, questionnaireId: questionnaire4.id },
    });

    await Favorite.findOrCreate({
      where: { userId: alice.id, questionnaireId: questionnaire5.id },
    });

    console.log("✅ 收藏记录创建完成");

    // 6. 创建答卷记录
    console.log("📋 创建答卷记录...");

    // normalUser 完成性格测试
    await Answer.create({
      questionnaireId: questionnaire1.id,
      userId: normalUser.id,
      detail: {
        answers: [
          { questionId: q1.id, value: "主动与人交流" },
          { questionId: q2.id, value: "逻辑分析" },
        ],
        submitTime: new Date(),
        score: 85,
      },
    });

    // alice 完成编程测试
    await Answer.create({
      questionnaireId: questionnaire2.id,
      userId: alice.id,
      detail: {
        answers: [
          { questionId: q3.id, value: ["JavaScript", "Python"] },
          {
            questionId: q4.id,
            value: "面向对象编程是一种编程范式，通过类和对象来组织代码...",
          },
        ],
        submitTime: new Date(),
        score: 92,
      },
    });

    // bob 完成电影偏好调查
    await Answer.create({
      questionnaireId: questionnaire6.id,
      userId: bob.id,
      detail: {
        answers: [
          { questionId: q11.id, value: ["科幻片", "动作片", "悬疑片"] },
          { questionId: q12.id, value: "电影院" },
        ],
        submitTime: new Date(),
        score: 88,
      },
    });

    // catherine 完成健康评估
    await Answer.create({
      questionnaireId: questionnaire4.id,
      userId: catherine.id,
      detail: {
        answers: [
          { questionId: q6.id, value: "7-8小时" },
          { questionId: q7.id, value: "3-4次" },
          { questionId: q8.id, value: ["定时喝水", "均衡饮食", "规律作息"] },
        ],
        submitTime: new Date(),
        score: 95,
      },
    });

    // catherine 完成压力管理测试
    await Answer.create({
      questionnaireId: questionnaire8.id,
      userId: catherine.id,
      detail: {
        answers: [
          { questionId: q15.id, value: "积极面对解决" },
          { questionId: q16.id, value: ["运动锻炼", "听音乐", "冥想放松"] },
        ],
        submitTime: new Date(),
        score: 91,
      },
    });

    // david 完成前端框架调查
    await Answer.create({
      questionnaireId: questionnaire9.id,
      userId: david.id,
      detail: {
        answers: [
          { questionId: q17.id, value: ["React", "Vue", "Next.js"] },
          { questionId: q18.id, value: "熟练使用" },
        ],
        submitTime: new Date(),
        score: 89,
      },
    });

    // alice 完成学习方法测评
    await Answer.create({
      questionnaireId: questionnaire5.id,
      userId: alice.id,
      detail: {
        answers: [
          { questionId: q9.id, value: "实践操作" },
          {
            questionId: q10.id,
            value:
              "我认为最有效的学习方法是理论与实践相结合，通过不断练习来巩固知识点...",
          },
        ],
        submitTime: new Date(),
        score: 87,
      },
    });

    // normalUser 完成手机使用调研
    await Answer.create({
      questionnaireId: questionnaire7.id,
      userId: normalUser.id,
      detail: {
        answers: [
          { questionId: q13.id, value: "3-5小时" },
          { questionId: q14.id, value: ["社交媒体", "视频娱乐", "新闻资讯"] },
        ],
        submitTime: new Date(),
        score: 78,
      },
    });

    console.log("✅ 答卷记录创建完成");

    // 7. 创建成就
    console.log("🏆 创建成就记录...");

    await Achievement.findOrCreate({
      where: { userId: normalUser.id },
      defaults: {
        points: 250,
        badges: ["新手", "完成者", "社交达人", "探索者"],
      },
    });

    await Achievement.findOrCreate({
      where: { userId: alice.id },
      defaults: {
        points: 450,
        badges: ["新手", "完成者", "技术专家", "高分获得者", "学霸", "多面手"],
      },
    });

    await Achievement.findOrCreate({
      where: { userId: bob.id },
      defaults: {
        points: 120,
        badges: ["新手", "电影达人"],
      },
    });

    await Achievement.findOrCreate({
      where: { userId: catherine.id },
      defaults: {
        points: 320,
        badges: ["新手", "完成者", "健康达人", "压力管理师"],
      },
    });

    await Achievement.findOrCreate({
      where: { userId: david.id },
      defaults: {
        points: 200,
        badges: ["新手", "完成者", "前端专家"],
      },
    });

    console.log("✅ 成就记录创建完成");

    // 8. 创建评论
    console.log("💬 创建评论...");

    await Comment.create({
      userId: normalUser.id,
      questionnaireId: questionnaire1.id,
      rating: 5,
      content: "这个测试很有趣，帮助我更好地了解自己的性格特点！",
    });

    await Comment.create({
      userId: alice.id,
      questionnaireId: questionnaire2.id,
      rating: 4,
      content: "题目设置合理，能较好地评估编程基础。建议增加实际编码题目。",
    });

    await Comment.create({
      userId: alice.id,
      questionnaireId: questionnaire1.id,
      rating: 5,
      content: "非常准确的性格分析，结果很符合我的实际情况。",
    });

    // 添加更多评论
    await Comment.create({
      userId: bob.id,
      questionnaireId: questionnaire6.id,
      rating: 5,
      content: "作为电影爱好者，这个调查很贴心！希望能根据结果推荐合适的电影。",
    });

    await Comment.create({
      userId: catherine.id,
      questionnaireId: questionnaire4.id,
      rating: 5,
      content: "健康评估很全面，提醒我要更加注意生活方式的改善。",
    });

    await Comment.create({
      userId: catherine.id,
      questionnaireId: questionnaire8.id,
      rating: 4,
      content: "压力管理测试很实用，给了我一些新的减压方法思路。",
    });

    await Comment.create({
      userId: david.id,
      questionnaireId: questionnaire9.id,
      rating: 4,
      content: "前端技能调查很专业，能帮助了解自己的技术栈掌握情况。",
    });

    await Comment.create({
      userId: alice.id,
      questionnaireId: questionnaire5.id,
      rating: 5,
      content: "学习方法评估帮我找到了更适合的学习方式，很有价值！",
    });

    await Comment.create({
      userId: normalUser.id,
      questionnaireId: questionnaire7.id,
      rating: 3,
      content: "手机使用调研让我意识到自己的手机依赖问题，需要改善。",
    });

    await Comment.create({
      userId: david.id,
      questionnaireId: questionnaire2.id,
      rating: 5,
      content: "编程技能测试很全面，涵盖了理论和实践两个方面。",
    });

    await Comment.create({
      userId: bob.id,
      questionnaireId: questionnaire1.id,
      rating: 4,
      content: "性格测试结果挺准确的，让我对自己有了新的认识。",
    });

    console.log("✅ 评论创建完成");

    // 9. 创建 AI 报告
    console.log("📊 创建 AI 报告...");

    await Report.create({
      userId: normalUser.id,
      questionnaireId: questionnaire1.id,
      type: "personality_analysis",
      content: {
        summary:
          "根据您的答题结果，您属于外向型性格，善于社交，决策时更依赖理性分析。",
        details: {
          traits: ["外向", "理性", "主动"],
          strengths: ["沟通能力强", "逻辑思维清晰", "适应性好"],
          suggestions: [
            "可以考虑团队领导角色",
            "继续发挥分析能力",
            "保持开放心态",
          ],
        },
        score_breakdown: {
          extroversion: 85,
          rationality: 90,
          adaptability: 75,
        },
      },
      chartData: {
        type: "radar",
        data: {
          labels: ["外向性", "理性度", "适应性", "创新性", "稳定性"],
          values: [85, 90, 75, 70, 80],
        },
      },
    });

    await Report.create({
      userId: alice.id,
      questionnaireId: questionnaire2.id,
      type: "skill_assessment",
      content: {
        summary: "您在编程技能方面表现优秀，特别是在前端技术和算法理解方面。",
        details: {
          strengths: ["JavaScript熟练", "Python应用", "面向对象理解"],
          level: "Intermediate",
          recommendations: ["深入学习框架", "提升系统设计能力", "多做项目实践"],
        },
        skill_scores: {
          javascript: 90,
          python: 85,
          algorithms: 88,
          system_design: 70,
        },
      },
      chartData: {
        type: "bar",
        data: {
          categories: ["前端开发", "后端开发", "算法", "系统设计", "数据库"],
          scores: [90, 80, 88, 70, 75],
        },
      },
    });

    // bob 的电影偏好分析报告
    await Report.create({
      userId: bob.id,
      questionnaireId: questionnaire6.id,
      type: "preference_analysis",
      content: {
        summary:
          "您偏爱视觉冲击力强的电影类型，喜欢在电影院享受完整的观影体验。",
        details: {
          preferences: ["科幻片", "动作片", "悬疑片"],
          characteristics: ["视觉导向", "体验主义", "探索精神"],
          recommendations: [
            "推荐《星际穿越》、《盗梦空间》等科幻佳作",
            "关注IMAX影院最新上映",
            "可以尝试参加电影讨论社区",
          ],
        },
        preference_scores: {
          visual_impact: 95,
          story_depth: 80,
          emotional_resonance: 70,
          entertainment: 90,
        },
      },
      chartData: {
        type: "pie",
        data: {
          labels: ["科幻片", "动作片", "悬疑片", "其他"],
          values: [40, 35, 25, 0],
        },
      },
    });

    // catherine 的健康评估报告
    await Report.create({
      userId: catherine.id,
      questionnaireId: questionnaire4.id,
      type: "health_assessment",
      content: {
        summary: "您的生活方式整体健康，在睡眠、运动和饮食方面都有良好的习惯。",
        details: {
          health_status: "优秀",
          strong_areas: ["充足睡眠", "规律运动", "健康饮食"],
          improvement_areas: ["可以增加户外活动", "适当补充维生素"],
          health_score: 95,
        },
        health_breakdown: {
          sleep_quality: 90,
          exercise_frequency: 85,
          diet_balance: 95,
          stress_level: 80,
          overall_wellness: 88,
        },
      },
      chartData: {
        type: "radar",
        data: {
          labels: ["睡眠质量", "运动频率", "饮食均衡", "压力水平", "整体健康"],
          values: [90, 85, 95, 80, 88],
        },
      },
    });

    // catherine 的压力管理分析
    await Report.create({
      userId: catherine.id,
      questionnaireId: questionnaire8.id,
      type: "stress_management",
      content: {
        summary: "您具有良好的压力应对能力，善于使用积极的方式处理压力。",
        details: {
          stress_level: "低",
          coping_style: "积极应对型",
          effective_methods: ["运动锻炼", "音乐放松", "冥想"],
          suggestions: [
            "继续保持现有的减压方法",
            "可以尝试瑜伽或太极",
            "建立更多社交支持网络",
          ],
        },
        stress_scores: {
          resilience: 91,
          emotional_stability: 88,
          problem_solving: 90,
          social_support: 75,
        },
      },
      chartData: {
        type: "bar",
        data: {
          categories: ["抗压能力", "情绪稳定", "问题解决", "社会支持"],
          scores: [91, 88, 90, 75],
        },
      },
    });

    // david 的前端技能报告
    await Report.create({
      userId: david.id,
      questionnaireId: questionnaire9.id,
      type: "skill_assessment",
      content: {
        summary:
          "您在前端开发领域具有扎实的技能基础，特别是在React生态系统方面。",
        details: {
          skill_level: "高级",
          expertise_areas: ["React", "Vue", "Next.js"],
          development_path: "全栈方向",
          next_steps: [
            "深入学习TypeScript",
            "掌握微服务架构",
            "提升性能优化技能",
          ],
        },
        framework_scores: {
          react: 89,
          vue: 75,
          angular: 40,
          nextjs: 85,
          typescript: 70,
        },
      },
      chartData: {
        type: "bar",
        data: {
          categories: ["React", "Vue", "Angular", "Next.js", "TypeScript"],
          scores: [89, 75, 40, 85, 70],
        },
      },
    });

    // alice 的学习方法分析
    await Report.create({
      userId: alice.id,
      questionnaireId: questionnaire5.id,
      type: "learning_analysis",
      content: {
        summary: "您是实践型学习者，通过动手操作能够最有效地掌握知识。",
        details: {
          learning_style: "实践型",
          preferred_methods: ["动手实践", "项目驱动"],
          learning_efficiency: "高",
          suggestions: ["多参与实际项目", "建立学习笔记体系", "定期复习和总结"],
        },
        learning_scores: {
          practical_ability: 92,
          theoretical_understanding: 78,
          knowledge_retention: 85,
          application_skills: 90,
        },
      },
      chartData: {
        type: "radar",
        data: {
          labels: ["实践能力", "理论理解", "知识保持", "应用技能"],
          values: [92, 78, 85, 90],
        },
      },
    });

    // normalUser 的手机使用分析
    await Report.create({
      userId: normalUser.id,
      questionnaireId: questionnaire7.id,
      type: "usage_analysis",
      content: {
        summary:
          "您的手机使用时间适中，主要用于社交和娱乐，建议合理规划使用时间。",
        details: {
          usage_level: "中等",
          main_activities: ["社交媒体", "视频娱乐", "新闻资讯"],
          risk_assessment: "低风险",
          recommendations: [
            "设置使用时间限制",
            "增加线下活动时间",
            "使用专注模式提高效率",
          ],
        },
        usage_breakdown: {
          social_media: 40,
          entertainment: 30,
          news: 20,
          productivity: 10,
        },
      },
      chartData: {
        type: "pie",
        data: {
          labels: ["社交媒体", "视频娱乐", "新闻资讯", "生产力工具"],
          values: [40, 30, 20, 10],
        },
      },
    });

    console.log("✅ AI 报告创建完成");

    console.log("\n🎉 所有示例数据插入完成！");
    console.log("\n📋 数据总结：");
    console.log(`- 分类: ${await Category.count()} 个`);
    console.log(`- 用户: ${await User.count()} 个`);
    console.log(`- 问卷: ${await Questionnaire.count()} 个`);
    console.log(`- 题目: ${await Question.count()} 个`);
    console.log(`- 收藏: ${await Favorite.count()} 个`);
    console.log(`- 答卷: ${await Answer.count()} 个`);
    console.log(`- 成就: ${await Achievement.count()} 个`);
    console.log(`- 评论: ${await Comment.count()} 个`);
    console.log(`- 报告: ${await Report.count()} 个`);

    console.log("\n🔑 测试账号：");
    console.log("管理员: admin@example.com / admin123");
    console.log("用户1: user@example.com / user123 (TestUser)");
    console.log("用户2: alice@example.com / alice123 (Alice)");
    console.log("用户3: bob@example.com / bob123 (Bob Wilson)");
    console.log("用户4: catherine@example.com / catherine123 (Catherine)");
    console.log("用户5: david@example.com / david123 (David Lee)");
    console.log(
      "封禁用户: banned@example.com / banned123 (BannedUser - 已封禁)"
    );
  } catch (error) {
    console.error("❌ Seed 过程出错:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行 seed
seedData()
  .then(() => {
    console.log("\n✅ Seed 脚本执行完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed 脚本执行失败:", error);
    process.exit(1);
  });
