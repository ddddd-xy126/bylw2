const { Answer, Survey, User, PointHistory, sequelize } = require("../models");

// 提交答案
exports.submitAnswer = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { surveyId, answers, duration, score, result } = req.body;

    // 检查问卷是否存在
    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    if (survey.status !== "published") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "问卷未发布，无法提交答案",
      });
    }

    // 允许用户多次填写问卷，只记录即可
    // 已移除重复检查逻辑

    // 创建答案记录
    const answer = await Answer.create(
      {
        id: Date.now().toString(),
        userId: req.user.id,
        surveyId,
        surveyTitle: survey.title,
        answers,
        score,
        result,
        duration,
        submittedAt: new Date(),
      },
      { transaction: t }
    );

    // 更新问卷统计
    await survey.increment("participantCount", { transaction: t });
    await survey.increment("responseCount", { transaction: t });

    // 奖励积分
    const pointsEarned = 10;
    await req.user.increment("points", { by: pointsEarned, transaction: t });
    await PointHistory.create(
      {
        id: `ph_${Date.now()}`,
        userId: req.user.id,
        points: pointsEarned,
        reason: `完成问卷《${survey.title}》`,
        type: "earn",
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      success: true,
      message: "答案提交成功",
      data: {
        answer,
        pointsEarned,
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 获取答案详情
exports.getAnswerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findByPk(id, {
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: ["id", "title", "questionList"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar"],
        },
      ],
    });

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "答案不存在",
      });
    }

    // 检查权限（只有答题者、问卷创建者和管理员可以查看）
    const survey = await Survey.findByPk(answer.surveyId);
    if (
      answer.userId !== req.user.id &&
      survey.userId !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "无权查看此答案",
      });
    }

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户在某个问卷的答案
exports.getUserAnswerForSurvey = async (req, res, next) => {
  try {
    const { surveyId } = req.params;

    const answer = await Answer.findOne({
      where: {
        userId: req.user.id,
        surveyId,
      },
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: ["id", "title", "questionList"],
        },
      ],
    });

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "未找到答题记录",
      });
    }

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

// 检查用户是否已经答过某个问卷
exports.checkAnswered = async (req, res, next) => {
  try {
    const { surveyId } = req.params;

    const answer = await Answer.findOne({
      where: {
        userId: req.user.id,
        surveyId,
      },
    });

    res.json({
      success: true,
      data: {
        hasAnswered: !!answer,
        answerId: answer?.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取答案列表（支持筛选）
exports.getAnswers = async (req, res, next) => {
  try {
    const { userId, surveyId, _sort, _order, _page, _limit } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (surveyId) where.surveyId = surveyId;

    const options = {
      where,
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar"],
        },
      ],
    };

    // 排序
    if (_sort) {
      options.order = [[_sort, _order || "ASC"]];
    } else {
      options.order = [["submittedAt", "DESC"]];
    }

    // 分页
    if (_page && _limit) {
      const page = parseInt(_page);
      const limit = parseInt(_limit);
      options.offset = (page - 1) * limit;
      options.limit = limit;
    } else if (_limit) {
      options.limit = parseInt(_limit);
    }

    const answers = await Answer.findAndCountAll(options);

    // 返回直接数组格式，兼容前端
    res.json(answers.rows);
  } catch (error) {
    next(error);
  }
};

// 删除答案
exports.deleteAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findByPk(id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "答案不存在",
      });
    }

    // 检查权限
    if (answer.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "无权删除此答案",
      });
    }

    await answer.destroy();

    res.json({
      success: true,
      message: "答案删除成功",
    });
  } catch (error) {
    next(error);
  }
};
