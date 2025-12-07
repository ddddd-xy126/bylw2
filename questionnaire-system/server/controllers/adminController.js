const {
  User,
  Survey,
  Answer,
  Comment,
  Announcement,
  AdminActivity,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// 获取仪表板统计
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSurveys,
      totalAnswers,
      totalComments,
      pendingSurveys,
    ] = await Promise.all([
      User.count(),
      Survey.count(),
      Answer.count(),
      Comment.count(),
      Survey.count({ where: { status: "pending" } }),
    ]);

    // 获取最近7天的统计
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentUsers, recentSurveys, recentAnswers] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Survey.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Answer.count({ where: { submittedAt: { [Op.gte]: sevenDaysAgo } } }),
    ]);

    res.json({
      success: true,
      data: {
        total: {
          users: totalUsers,
          surveys: totalSurveys,
          answers: totalAnswers,
          comments: totalComments,
          pendingSurveys,
        },
        recent: {
          users: recentUsers,
          surveys: recentSurveys,
          answers: recentAnswers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取所有用户（管理员）
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { nickname: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        total: users.count,
        page: parseInt(page),
        totalPages: Math.ceil(users.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 更新用户角色
exports.updateUserRole = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    await user.update({ role }, { transaction: t });

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "更新用户角色",
        description: `将用户 ${user.username} 的角色更新为 ${role}`,
        type: "user_role_update",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: "用户角色更新成功",
      data: user.toSafeObject(),
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 封禁用户
exports.banUser = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    if (user.id === req.user.id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "不能封禁自己",
      });
    }

    await user.update({ banned: true }, { transaction: t });

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "封禁用户",
        description: `封禁用户 ${user.username}`,
        type: "user_ban",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: "用户已封禁",
      data: user.toSafeObject(),
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 解封用户
exports.unbanUser = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    await user.update({ banned: false }, { transaction: t });

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "解封用户",
        description: `解封用户 ${user.username}`,
        type: "user_unban",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: "用户已解封",
      data: user.toSafeObject(),
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 重置用户密码
exports.resetPassword = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 设置默认密码
    const newPassword = "admin123";
    user.password = newPassword;
    await user.save({ transaction: t });

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "重置密码",
        description: `重置用户 ${user.username} 的密码`,
        type: "user_password_reset",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: "密码重置成功",
      newPassword: newPassword,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 删除用户
exports.deleteUser = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    if (user.id === req.user.id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "不能删除自己",
      });
    }

    await user.destroy({ transaction: t });

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "删除用户",
        description: `删除用户 ${user.username}`,
        type: "user_delete",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: "用户删除成功",
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 审核问卷
exports.reviewSurvey = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, reason } = req.body; // status: 'published' or 'stopped'

    const survey = await Survey.findByPk(id);

    if (!survey) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "问卷不存在",
      });
    }

    await survey.update(
      {
        status,
        ...(status === "published" &&
          !survey.publishedAt && { publishedAt: new Date() }),
      },
      { transaction: t }
    );

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "审核问卷",
        description: `将问卷《${survey.title}》状态更新为 ${status}${
          reason ? `，原因：${reason}` : ""
        }`,
        type: "survey_review",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: "问卷审核成功",
      data: survey,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 获取所有公告
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const announcements = await Announcement.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        announcements: announcements.rows,
        total: announcements.count,
        page: parseInt(page),
        totalPages: Math.ceil(announcements.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 创建公告
exports.createAnnouncement = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { title, content, type, priority, isActive } = req.body;

    const announcement = await Announcement.create(
      {
        title,
        content,
        type: type || "info",
        priority: priority
          ? typeof priority === "string"
            ? priority === "high"
              ? 2
              : priority === "low"
              ? 0
              : 1
            : priority
          : 1,
        isActive: isActive !== undefined ? isActive : true,
        publishedAt: new Date(),
        status: "published",
        createdBy: String(req.user.id),
      },
      { transaction: t }
    );

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "创建公告",
        description: `创建公告《${title}》`,
        type: "announcement_create",
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      success: true,
      message: "公告创建成功",
      data: announcement,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 更新公告
exports.updateAnnouncement = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const updates = req.body;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "公告不存在",
      });
    }

    await announcement.update(updates, { transaction: t });

    // 记录管理员活动
    await AdminActivity.create(
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        adminId: String(req.user.id),
        adminName: req.user.nickname || req.user.username,
        title: "更新公告",
        description: `更新公告《${announcement.title}》`,
        type: "announcement_update",
      },
      { transaction: t }
    );

    await t.commit();

    res.json({
      success: true,
      message: "公告更新成功",
      data: announcement,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 删除公告
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "公告不存在",
      });
    }

    await announcement.destroy();

    res.json({
      success: true,
      message: "公告删除成功",
    });
  } catch (error) {
    next(error);
  }
};

// 获取管理员活动日志
exports.getActivities = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const where = {};
    if (type) where.type = type;

    const activities = await AdminActivity.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "admin",
          attributes: ["id", "username", "nickname", "avatar"],
        },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]],
    });

    // 前端期望直接数组,axios拦截器会解包data字段
    res.json({
      success: true,
      data: activities.rows,
    });
  } catch (error) {
    next(error);
  }
};

// 创建管理员活动记录
exports.createActivity = async (req, res, next) => {
  try {
    const { id, adminId, adminName, title, description, type } = req.body;

    const activity = await AdminActivity.create({
      id: id || `act_${Date.now()}`,
      adminId: adminId || req.user.id,
      adminName: adminName || req.user.nickname || req.user.username,
      title,
      description,
      type,
    });

    res.status(201).json({
      success: true,
      message: "活动记录创建成功",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
