const { Comment, Survey, User, sequelize } = require("../models");

// 获取问卷的评论列表
exports.getComments = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.findAndCountAll({
      where: {
        surveyId,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar"],
        },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        comments: comments.rows,
        total: comments.count,
        page: parseInt(page),
        totalPages: Math.ceil(comments.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 创建评论
exports.createComment = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { surveyId } = req.params;
    const { content, rating } = req.body;

    // 检查问卷是否存在
    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    // 创建评论
    const comment = await Comment.create(
      {
        userId: req.user.id,
        surveyId,
        username: req.user.nickname || req.user.username,
        avatar: req.user.avatar,
        content,
        rating,
      },
      { transaction: t }
    );

    // 如果有评分，更新问卷的平均评分
    if (rating) {
      const totalRating =
        survey.averageRating * survey.ratingCount + parseFloat(rating);
      const newRatingCount = survey.ratingCount + 1;
      const newAverageRating = totalRating / newRatingCount;

      await survey.update(
        {
          averageRating: newAverageRating.toFixed(2),
          ratingCount: newRatingCount,
        },
        { transaction: t }
      );
    }

    await t.commit();

    // 重新查询以包含关联数据
    const newComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "评论发表成功",
      data: newComment,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 更新评论
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "评论不存在",
      });
    }

    // 检查权限
    if (comment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "无权修改此评论",
      });
    }

    await comment.update({
      content,
      rating,
    });

    res.json({
      success: true,
      message: "评论更新成功",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// 删除评论（软删除）
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "评论不存在",
      });
    }

    // 检查权限
    if (comment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "无权删除此评论",
      });
    }

    await comment.update({ isDeleted: true });

    res.json({
      success: true,
      message: "评论删除成功",
    });
  } catch (error) {
    next(error);
  }
};
