积分与成就徽章系统
1、简要描述
（1）功能描述：积分与成就徽章系统是问卷平台的激励机制，通过给予用户积分奖励和解锁成就徽章，鼓励用户积极参与问卷填写、创建问卷、完善资料等行为。系统包含积分获取、积分历史记录、等级计算、成就徽章解锁等功能模块。

（2）代码逻辑：用户在系统中执行各类操作（如注册、完成问卷、创建问卷、提交审核等）时，后端对应的控制器方法会调用User.increment('points', {by: pointsEarned})增加用户积分，同时创建PointHistory记录保存积分数量、原因描述、类型和创建时间，提交事务确保积分增加和历史记录的一致性。用户等级根据当前积分总数自动计算，公式为：等级 = Math.floor(积分 / 500) + 1，前端在个人成就页面通过computed计算实时显示用户等级，无需后端存储。系统预定义多个成就徽章，每个徽章有类型和requirement要求。对于徽章解锁，当用户完成特定操作后，后端调用checkAndUnlockBadge函数检查该操作对应的徽章类型，查询用户当前统计数据（如已完成问卷数），判断是否达到徽章要求。若满足要求且用户未解锁该徽章，则在UserBadge表创建关联记录标记解锁，同时奖励徽章对应的积分（如20积分），创建积分历史记录原，并向前端返回解锁提示。前端访问成就页面时，调用接口获取所有徽章定义和用户已解锁徽章列表，对比后显示徽章解锁状态和进度（如"5/10"）。

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

***时序图最新描述***
    用户->>前端答题页面: ① 提交问卷答案
    前端答题页面->>API层(survey.js): ② 调用提交答案接口
    API层(survey.js)->>后端路由(answers.js): ③ POST /answers
    后端路由(answers.js)->>控制器(answerController.js): ④ 调用submitAnswer方法
    控制器(answerController.js)->>数据库: ⑤ 开启事务:创建Answer记录
    控制器(answerController.js)->>数据库: ⑥ 更新User.points字段(+10)
    控制器(answerController.js)->>数据库: ⑦ 创建PointHistory记录
    控制器(answerController.js)->>数据库: ⑧ 提交事务
    数据库-->>控制器(answerController.js): ⑨ 返回操作结果
    控制器(answerController.js)-->>前端答题页面: ⑩ 返回{pointsEarned: 10}
    前端答题页面->>用户: ⑪ 显示"问卷提交成功!获得10积分"
    用户->>前端个人成就页面: ⑫ 访问积分历史页面
    前端个人成就页面->>API层(user.js): ⑬ 调用获取积分历史接口
    API层(user.js)->>后端路由(users.js): ⑭ GET /users/:id/point-history
    后端路由(users.js)->>控制器(userController.js): ⑮ 调用getPointHistory方法
    控制器(userController.js)->>数据库: ⑯ 查询PointHistory表(分页+排序)
    数据库-->>控制器(userController.js): ⑰ 返回历史记录列表
    控制器(userController.js)-->>前端个人成就页面: ⑱ 返回{history, total, page}
    前端个人成就页面->>用户: ⑲ 渲染时间轴展示积分变动
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

3、关键代码
代码 5-16 积分与成就徽章系统核心代码

// 获取积分历史 (userController.js)
exports.getPointHistory = async (req, res, next) => {
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
    },
  });
};

// 等级计算 (AchievementsPage.vue)
const getUserLevel = computed(() => {
  return Math.floor((userStats.value.points || 0) / 500) + 1;
});

// 检查并解锁徽章 (badgeService.js)
const checkAndUnlockBadge = async (userId, badgeType, currentValue) => {
  const badge = await Badge.findOne({ where: { type: badgeType } });
  if (!badge) return;

  // 检查是否满足要求
  if (currentValue >= badge.requirement) {
    const userBadge = await UserBadge.findOne({ where: { userId, badgeId: badge.id } });
    
    // 如果未解锁则解锁
    if (!userBadge) {
      await UserBadge.create({ userId, badgeId: badge.id, unlockedAt: new Date() });
      
      // 奖励积分
      await User.increment('points', { by: badge.points, where: { id: userId } });
      await PointHistory.create({
        id: `ph_${Date.now()}`,
        userId,
        points: badge.points,
        reason: `解锁徽章《${badge.name}》`,
        type: "earn",
      });
      
      return { unlocked: true, badge, pointsEarned: badge.points };
    }
  }
  return { unlocked: false };
};
