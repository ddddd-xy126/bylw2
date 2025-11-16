const { User, Survey, Answer, Favorite, PointHistory } = require("../models");
const { Op } = require("sequelize");

// 获取所有用户列表
exports.getAllUsers = async (req, res, next) => {
  try {
    const { _sort, _order, _limit, page = 1, limit = 10 } = req.query;

    const queryOptions = {
      attributes: { exclude: ["password"] },
      limit: _limit ? parseInt(_limit) : parseInt(limit),
      offset: _limit ? 0 : (page - 1) * limit,
    };

    // 处理排序
    if (_sort) {
      queryOptions.order = [[_sort, _order || "ASC"]];
    } else {
      queryOptions.order = [["createdAt", "DESC"]];
    }

    const users = await User.findAndCountAll(queryOptions);

    res.json(users.rows);
  } catch (error) {
    next(error);
  }
};

// 获取单个用户
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// 更新用户
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // 不允许修改敏感字段
    delete updates.id;
    delete updates.password;
    delete updates.role;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    await user.update(updates);

    res.json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户资料
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户资料
exports.updateProfile = async (req, res, next) => {
  try {
    const { nickname, avatar, gender, age, city, bio, profession } = req.body;

    await req.user.update({
      nickname,
      avatar,
      gender,
      age,
      city,
      bio,
      profession,
    });

    res.json({
      success: true,
      message: "资料更新成功",
      data: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// 修改密码
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 验证旧密码
    const isValid = await req.user.validatePassword(oldPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "原密码错误",
      });
    }

    // 更新密码
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      success: true,
      message: "密码修改成功",
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户统计信息
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;

    const [surveyCount, answerCount, favoriteCount] = await Promise.all([
      Survey.count({ where: { userId } }),
      Answer.count({ where: { userId } }),
      Favorite.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        surveyCount,
        answerCount,
        favoriteCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的问卷列表
exports.getUserSurveys = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const surveys = await Survey.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        surveys: surveys.rows,
        total: surveys.count,
        page: parseInt(page),
        totalPages: Math.ceil(surveys.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的答题记录
exports.getUserAnswers = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const answers = await Answer.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: ["id", "title", "category", "duration"],
        },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["submittedAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        answers: answers.rows,
        total: answers.count,
        page: parseInt(page),
        totalPages: Math.ceil(answers.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的收藏列表
exports.getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const favorites = await Favorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: [
            "id",
            "title",
            "description",
            "category",
            "participantCount",
            "averageRating",
          ],
        },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        favorites: favorites.rows,
        total: favorites.count,
        page: parseInt(page),
        totalPages: Math.ceil(favorites.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取用户的积分历史
exports.getPointHistory = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const history = await PointHistory.findAndCountAll({
      where: { userId },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        history: history.rows,
        total: history.count,
        page: parseInt(page),
        totalPages: Math.ceil(history.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
