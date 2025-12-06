const { body, param, query, validationResult } = require("express-validator");

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "数据验证失败",
      errors: errors.array(),
    });
  }
  next();
};

// 注册验证 - 简化版本，只验证必要字段
exports.validateRegister = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("用户名不能为空")
    .isLength({ min: 1, max: 50 })
    .withMessage("用户名长度不能超过 50"),
  body("email")
    .optional({ checkFalsy: true }) // email 可选，如果提供则验证格式
    .trim()
    .isEmail()
    .withMessage("请提供有效的邮箱地址"),
  body("password")
    .notEmpty()
    .withMessage("密码不能为空")
    .isLength({ min: 6 })
    .withMessage("密码长度至少为 6 位"),
  body("nickname")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("昵称长度不能超过 50"),
  handleValidationErrors,
];

// 登录验证
exports.validateLogin = [
  body("username").trim().notEmpty().withMessage("用户名不能为空"),
  body("password").notEmpty().withMessage("密码不能为空"),
  handleValidationErrors,
];

// 创建问卷验证
exports.validateSurvey = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("问卷标题长度必须在 1-200 之间"),
  body("questionList").isArray({ min: 1 }).withMessage("问卷至少需要一个问题"),
  handleValidationErrors,
];

// 提交答案验证
exports.validateAnswer = [
  body("surveyId").notEmpty().withMessage("问卷ID不能为空"),
  body("answers").isArray().withMessage("答案必须是数组"),
  handleValidationErrors,
];

// 评论验证
exports.validateComment = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("评论内容长度必须在 1-1000 之间"),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("评分必须在 0-5 之间"),
  handleValidationErrors,
];

// ID 参数验证 - 支持字符串ID
exports.validateId = [
  param("id").notEmpty().withMessage("ID不能为空"),
  handleValidationErrors,
];

// 分页验证
exports.validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("页码必须是大于0的整数"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 5000 })
    .withMessage("每页数量必须在 1-5000 之间"),
  handleValidationErrors,
];
