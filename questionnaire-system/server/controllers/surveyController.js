const {
  Survey,
  User,
  Answer,
  Comment,
  Favorite,
  Category,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// 获取问卷列表
exports.getSurveys = async (req, res, next) => {
  try {
    const {
      status,
      category,
      categoryId,
      isTemplate,
      authorId,
      search,
      sortBy = "createdAt",
      order = "DESC",
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};

    // 筛选条件
    if (status) where.status = status;
    if (category) where.category = category;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.userId = authorId;
    if (isTemplate !== undefined) where.isTemplate = isTemplate === "true";
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    console.log("[getSurveys] 查询条件:", where);
    console.log("[getSurveys] isTemplate参数:", isTemplate);

    const surveys = await Survey.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "nickname", "avatar"],
        },
        {
          model: Category,
          as: "categoryInfo",
          attributes: ["id", "name", "slug", "color"],
        },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [[sortBy, order.toUpperCase()]],
    });

    // 前端期望直接返回数组,axios拦截器会解包data字段
    res.json({
      success: true,
      data: surveys.rows,
    });
  } catch (error) {
    next(error);
  }
};

// 获取单个问卷详情
exports.getSurveyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "username", "nickname", "avatar"],
        },
        {
          model: Category,
          as: "categoryInfo",
          attributes: ["id", "name", "slug", "color"],
        },
      ],
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    res.json({
      success: true,
      data: survey,
    });
  } catch (error) {
    next(error);
  }
};

// 创建问卷
exports.createSurvey = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const {
      title,
      description,
      category,
      categoryId,
      questionList,
      isTemplate,
      duration,
      tags,
      settings,
      status,
    } = req.body;

    const survey = await Survey.create(
      {
        id: Date.now().toString(),
        userId: req.user.id,
        title,
        description,
        category,
        categoryId,
        questionList,
        isTemplate: isTemplate || false,
        duration,
        tags: tags || [],
        settings: settings || {},
        status: status || "draft",
        questions: questionList?.length || 0,
      },
      { transaction: t }
    );

    // 积分奖励逻辑
    const PointHistory = require("../models").PointHistory;
    let pointsEarned = 0;
    let rewardReason = "";

    if (status === "draft") {
      // 创建问卷（草稿）: 获得 3 积分
      pointsEarned = 3;
      rewardReason = `创建问卷《${title}》`;
    } else if (status === "pending") {
      // 提交审核: 获得 5 积分
      pointsEarned = 5;
      rewardReason = `提交问卷《${title}》审核`;
    } else if (status === "published" && req.user.role === "admin") {
      // 管理员直接发布: 获得 3 积分（创建）
      pointsEarned = 3;
      rewardReason = `创建并发布问卷《${title}》`;
    }

    if (pointsEarned > 0) {
      await req.user.increment("points", { by: pointsEarned, transaction: t });
      await PointHistory.create(
        {
          id: `ph_${Date.now()}`,
          userId: req.user.id,
          points: pointsEarned,
          reason: rewardReason,
          type: "earn",
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.status(201).json({
      success: true,
      message: "问卷创建成功",
      data: {
        ...survey.toJSON(),
        pointsEarned,
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 更新问卷
exports.updateSurvey = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      categoryId,
      questionList,
      status,
      duration,
      isTemplate,
    } = req.body;

    const survey = await Survey.findByPk(id);

    if (!survey) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    // 检查权限（只有创建者或管理员可以修改）
    if (survey.userId !== req.user.id && req.user.role !== "admin") {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "无权修改此问卷",
      });
    }

    const oldStatus = survey.status;
    const newStatus = status || oldStatus;

    // 积分奖励逻辑
    const PointHistory = require("../models").PointHistory;
    let pointsEarned = 0;
    let rewardReason = "";

    // 如果从草稿状态提交审核，奖励 5 积分
    if (oldStatus === "draft" && newStatus === "pending") {
      pointsEarned = 5;
      rewardReason = `提交问卷《${title || survey.title}》审核`;
    }

    await survey.update(
      {
        title,
        description,
        category,
        categoryId,
        questionList,
        status: newStatus,
        duration,
        isTemplate: isTemplate !== undefined ? isTemplate : survey.isTemplate,
        ...(newStatus === "published" &&
          !survey.publishedAt && { publishedAt: new Date() }),
      },
      { transaction: t }
    );

    if (pointsEarned > 0) {
      await req.user.increment("points", { by: pointsEarned, transaction: t });
      await PointHistory.create(
        {
          id: `ph_${Date.now()}`,
          userId: req.user.id,
          points: pointsEarned,
          reason: rewardReason,
          type: "earn",
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.json({
      success: true,
      message: "问卷更新成功",
      data: {
        ...survey.toJSON(),
        pointsEarned,
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 删除问卷
exports.deleteSurvey = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id);

    if (!survey) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    // 检查权限
    if (survey.userId !== req.user.id && req.user.role !== "admin") {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: "无权删除此问卷",
      });
    }

    // 将问卷移到回收站
    const RecycleBin = require("../models").RecycleBin;
    await RecycleBin.create(
      {
        id: `rb_${Date.now()}`,
        userId: survey.userId,
        itemType: "survey",
        itemId: survey.id,
        itemData: survey.toJSON(),
        deletedAt: new Date(),
      },
      { transaction: t }
    );

    // 删除问卷
    await survey.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: "问卷已移至回收站",
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 获取问卷统计数据
exports.getSurveyStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id, {
      include: [
        {
          model: Answer,
          as: "answers",
          attributes: ["id", "answers", "score", "submittedAt"],
        },
      ],
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    // 计算统计数据
    const statistics = calculateSurveyStatistics(survey);

    res.json({
      success: true,
      data: {
        survey: {
          id: survey.id,
          title: survey.title,
          questionList: survey.questionList,
        },
        statistics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 辅助函数：计算问卷统计
function calculateSurveyStatistics(survey) {
  const answers = survey.answers || [];
  const questions = survey.questionList || [];

  const stats = {
    totalResponses: answers.length,
    questions: [],
  };

  questions.forEach((question, index) => {
    const questionStats = {
      questionId: question.id,
      questionText: question.text,
      questionType: question.type,
      responses: [],
    };

    if (question.type === "single" || question.type === "multiple") {
      // 选择题统计
      const optionCounts = {};
      question.options?.forEach((opt) => {
        optionCounts[opt] = 0;
      });

      answers.forEach((answer) => {
        const userAnswer = answer.answers[index];
        if (Array.isArray(userAnswer)) {
          userAnswer.forEach((opt) => {
            if (optionCounts[opt] !== undefined) {
              optionCounts[opt]++;
            }
          });
        } else if (userAnswer && optionCounts[userAnswer] !== undefined) {
          optionCounts[userAnswer]++;
        }
      });

      questionStats.responses = Object.entries(optionCounts).map(
        ([option, count]) => ({
          option,
          count,
          percentage:
            answers.length > 0
              ? ((count / answers.length) * 100).toFixed(2)
              : 0,
        })
      );
    } else if (question.type === "text") {
      // 文本题
      questionStats.responses = answers
        .map((answer) => answer.answers[index])
        .filter(Boolean);
    } else if (question.type === "rating") {
      // 评分题
      const ratings = answers
        .map((answer) => answer.answers[index])
        .filter((r) => r !== null && r !== undefined);

      const sum = ratings.reduce((acc, val) => acc + parseFloat(val), 0);
      questionStats.averageRating =
        ratings.length > 0 ? (sum / ratings.length).toFixed(2) : 0;
      questionStats.totalRatings = ratings.length;
    }

    stats.questions.push(questionStats);
  });

  return stats;
}

// 收藏/取消收藏问卷
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    const existing = await Favorite.findOne({
      where: {
        userId: req.user.id,
        surveyId: id,
      },
    });

    if (existing) {
      // 取消收藏
      await existing.destroy();
      await survey.decrement("favoriteCount");

      res.json({
        success: true,
        message: "已取消收藏",
        data: { isFavorited: false },
      });
    } else {
      // 添加收藏
      await Favorite.create({
        id: `fav_${Date.now()}_${req.user.id}`,
        userId: req.user.id,
        surveyId: id,
        surveyTitle: survey.title,
        category: survey.category,
        author: req.user.username,
        description: survey.description,
        participants: survey.participantCount,
        rating: survey.averageRating,
        duration: survey.duration,
      });
      await survey.increment("favoriteCount");

      res.json({
        success: true,
        message: "收藏成功",
        data: { isFavorited: true },
      });
    }
  } catch (error) {
    next(error);
  }
};

// 检查是否收藏
exports.checkFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        userId: req.user.id,
        surveyId: id,
      },
    });

    res.json({
      success: true,
      data: { isFavorited: !!favorite },
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户创建的问卷
exports.getUserSurveys = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const surveys = await Survey.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    // 包装在{success,data}中,axios拦截器会自动解包data字段为数组
    res.json({
      success: true,
      data: surveys,
    });
  } catch (error) {
    next(error);
  }
};
