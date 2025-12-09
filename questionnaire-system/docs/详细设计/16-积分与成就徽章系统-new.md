积分与成就徽章系统
1、简要描述
（1）功能描述：积分与成就徽章系统是问卷平台的激励机制，通过给予用户积分奖励和解锁成就徽章，鼓励用户积极参与问卷填写、创建问卷、完善资料等行为。系统包含积分获取、积分历史记录、等级计算、成就徽章解锁等功能模块。

（2）代码逻辑：用户执行操作（如注册、完成问卷、创建问卷）时，后端在数据库事务中调用 user.increment('points', {by: pointsEarned}) 增加用户积分，同时创建 PointHistory 记录保存积分数量、原因描述、类型(earn/spend)和创建时间，提交事务确保一致性。等级根据积分自动计算：等级 = Math.floor(积分 / 500) + 1。成就徽章系统通过检测用户行为统计数据，判断是否满足徽章的 requirement 要求，若满足且未解锁则创建用户徽章关联记录、奖励对应积分、创建积分历史并显示解锁提示。前端查询积分历史时调用 getPointHistory 接口，后端按用户ID筛选并分页返回历史记录列表（按创建时间倒序）。成就页面展示积分总数、已完成问卷数、已解锁徽章数等统计卡片，徽章列表支持筛选已解锁/未解锁，未解锁徽章显示当前进度（如"5/10"）。

时序图描述
用户 → 注册页面: 填写注册信息并提交
注册页面 → authController: POST /auth/register
authController → MySQL: 开启事务，创建用户(points: 100)
authController → MySQL: 创建PointHistory记录("注册奖励", 100积分)
MySQL → authController: 返回用户数据
authController → 注册页面: 返回{token, user}
注册页面 → 用户: 显示"注册成功,获得100积分"

用户 → 答题页面: 完成问卷并提交
答题页面 → answerController: POST /answers
answerController → MySQL: 开启事务，创建答案记录
answerController → MySQL: increment增加积分(points + 10)
answerController → MySQL: 创建PointHistory记录("完成问卷《xxx》", 10积分)
answerController → MySQL: 提交事务
answerController → 答题页面: 返回{pointsEarned: 10}
答题页面 → 用户: 显示"问卷提交成功!获得10积分"

用户 → 个人成就页面: 访问个人成就页面
个人成就页面 → userController: GET /users/:id/point-history
userController → MySQL: 查询PointHistory表(where userId, order DESC)
MySQL → userController: 返回历史记录列表
userController → 个人成就页面: 返回{history, total, page}
个人成就页面 → 用户: 渲染时间轴展示积分变动

***时序图描述***
用户 → 前端界面: 触发积分相关操作
前端界面 → 后端API: 调用对应接口
后端API → MySQL: 在事务中更新积分和创建历史记录
MySQL → 后端API: 返回操作结果
后端API → 前端界面: 返回积分数据
前端界面 → 用户: 显示积分提示和统计信息
***end***


2、接口定义
表 5-16 积分与成就徽章系统接口表

接口名称 获取积分历史接口
接口描述 查询用户积分变动历史记录，支持分页
URL {{baseurl}}/users/:id/point-history?page=1&limit=20
method GET
请求参数 {"page": 1, "limit": 20} (可选)
返回参数 {"success": true, "data": {"history": [{"id": "ph_123", "userId": "user_123", "points": 10, "reason": "完成问卷", "type": "earn", "createdAt": "..."}], "total": 50, "page": 1, "totalPages": 3}}

接口名称 获取所有徽章定义接口
接口描述 查询系统所有成就徽章定义
URL {{baseurl}}/badges
method GET
请求参数 无
返回参数 [{"id": "badge_survey_10", "name": "问卷达人", "description": "完成10份问卷", "type": "survey_count", "requirement": 10, "points": 20}, ...]

接口名称 获取用户已解锁徽章接口
接口描述 查询用户已解锁的徽章ID列表
URL {{baseurl}}/users/:id/badges
method GET
请求参数 无
返回参数 {"success": true, "data": ["badge_survey_10", "badge_continuous_7", ...]}

3、关键代码
代码 5-16 积分与成就徽章系统核心代码

// 注册赠送积分 (authController.js)
exports.register = async (req, res, next) => {
  try {
    const user = await User.create({
      id: Date.now().toString(),
      username, email, password: hashedPassword,
      points: 100, // 初始积分
    });

    // 记录积分历史
    await PointHistory.create({
      id: `ph_${Date.now()}`,
      userId: user.id,
      points: 100,
      reason: "注册奖励",
      type: "earn",
    });

    const token = jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret);
    res.json({ success: true, data: { token, user } });
  } catch (error) {
    next(error);
  }
};

// 完成问卷奖励积分 (answerController.js)
exports.submitAnswer = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const answer = await Answer.create({ surveyId, userId: req.user.id, answers }, { transaction: t });

    // 增加用户积分
    await User.increment('points', { by: 10, where: { id: req.user.id }, transaction: t });

    // 记录积分历史
    await PointHistory.create({
      id: `ph_${Date.now()}`,
      userId: req.user.id,
      points: 10,
      reason: `完成问卷《${survey.title}》`,
      type: "earn",
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, data: { answer, pointsEarned: 10 } });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// 获取积分历史 (userController.js)
exports.getPointHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const history = await PointHistory.findAndCountAll({
      where: { userId: req.params.id },
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

// 前端等级计算 (AchievementsPage.vue)
const getUserLevel = computed(() => {
  return Math.floor((userStats.value.points || 0) / 500) + 1;
});
