const { User, PointHistory } = require("../models");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Op } = require("sequelize");

// 注册
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, nickname } = req.body;

    // 检查用户名是否已存在（主要检查）
    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "用户名已存在，请重新输入",
      });
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "邮箱已存在",
        });
      }
    }

    // 创建用户
    const user = await User.create({
      id: Date.now().toString(), // 使用时间戳生成 ID
      username,
      email: email || `${username}@example.com`, // 如果没有邮箱，生成默认邮箱
      password,
      nickname: nickname || username,
      points: 100, // 注册赠送 100 积分
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    });

    // 记录积分历史
    await PointHistory.create({
      id: `ph_${Date.now()}`,
      userId: user.id,
      points: 100,
      reason: "注册奖励",
      type: "earn",
    });

    // 生成 Token
    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 登录
exports.login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 支持用户名或邮箱登录
    const loginField = username || email;
    if (!loginField) {
      return res.status(400).json({
        success: false,
        message: "请提供用户名或邮箱",
      });
    }

    // 查找用户（支持用户名或邮箱）
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: loginField }, { email: loginField }],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 生成 Token
    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    res.json({
      success: true,
      message: "登录成功",
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 登出
exports.logout = (req, res) => {
  // JWT 是无状态的，客户端删除 token 即可
  res.json({
    success: true,
    message: "登出成功",
  });
};

// 刷新 Token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token: oldToken } = req.body;

    if (!oldToken) {
      return res.status(400).json({
        success: false,
        message: "未提供令牌",
      });
    }

    // 验证旧 token（忽略过期）
    const decoded = jwt.verify(oldToken, jwtConfig.secret, {
      ignoreExpiration: true,
    });

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 生成新 Token
    const newToken = jwt.sign(
      { id: user.id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      success: true,
      message: "令牌刷新成功",
      data: {
        token: newToken,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: PointHistory,
          as: "pointHistories",
          limit: 10,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    res.json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};
