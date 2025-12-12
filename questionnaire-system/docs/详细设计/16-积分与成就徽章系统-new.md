积分与成就徽章系统
1、简要描述
（1）功能描述：积分与成就徽章系统是问卷平台的激励机制，通过给予用户积分奖励和解锁成就徽章，鼓励用户积极参与问卷填写、创建问卷、完善资料等行为。
（2）代码逻辑：
用户在系统中执行各类操作（如注册、完成问卷、创建问卷、提交审核等）时，后端对应的控制器方法会调用User.increment('points', {by: pointsEarned})增加用户积分，同时在数据库创建PointHistory记录保存积分数量、原因描述、类型和创建时间。用户等级根据当前积分总数自动计算，公式为：等级= Math.floor(积分/500) + 1，前端在个人成就页面通过计算实时显示用户等级，无需后端存储。系统预定义多个成就徽章，每个徽章有类型和要求。用户的已解锁徽章ID存储在User表的unlockedBadges字段中。用户访问个人成就页面时，前端获取所有徽章定义和用户的unlockedBadges数组，通过计算用户当前各项统计数据（如已完成问卷数、创建问卷数、连续登录天数等），对比每个徽章的要求，判断是否达到解锁条件。若满足条件且用户未解锁该徽章，前端自动将徽章ID添加到unlockedBadges数组并更新用户积分，更新后的数据同步到后端，同时显示徽章解锁动画和积分奖励提示。前端页面根据 unlockedBadges数组和徽章定义数据，对比显示每个徽章的解锁状态和进度。

**_时序图描述_**

**流程一：用户操作获取积分**
用户->>前端页面: ① 执行特定操作（完成问卷、创建问卷等）
前端页面->>API层: ② 调用操作相关接口（如submitAnswer）
API层->>后端路由: ③ POST请求到对应路由
后端路由->>控制器(如answerController.js): ④ 调用控制器方法处理业务
控制器->>数据库: ⑤ 创建业务记录（Answer等）、更新User.points字段、创建PointHistory记录
数据库-->>控制器: ⑥ 返回操作结果
控制器-->>前端页面: ⑦ 返回{success: true, pointsEarned: 10}
前端页面->>用户: ⑧ 显示操作成功和积分获取提示

**流程二：访问成就页面查看积分历史**
用户->>前端成就页面(AchievementsPage.vue): ⑨ 访问个人成就页面
前端成就页面->>API层: ⑩ GET /badges（获取所有徽章定义）
API层->>后端路由(badges.js): ⑪ 转发请求
后端路由->>数据库: ⑫ 查询Badge表所有记录
数据库-->>前端成就页面: ⑬ 返回徽章定义列表[{id, name, type, requirement, points}]
前端成就页面->>API层: ⑭ GET /users/:id（获取用户信息）
API层->>后端路由(users.js): ⑮ 转发请求
后端路由->>数据库: ⑯ 查询User表，获取points和unlockedBadges字段
数据库-->>前端成就页面: ⑰ 返回用户数据{points, unlockedBadges: ["badge_id1", "badge_id2"]}
前端成就页面->>前端成就页面: ⑱ 计算用户各项统计数据（完成问卷数、创建数等）
前端成就页面->>前端成就页面: ⑲ 对比unlockedBadges数组，分离已解锁和未解锁徽章
前端成就页面->>前端成就页面: ⑳ 检查未解锁徽章，对比当前进度与requirement判断是否达到解锁条件
前端成就页面->>API层: ㉑ （如有新解锁）PATCH /users/:id 更新unlockedBadges数组和points
API层->>后端路由: ㉒ 转发更新请求
后端路由->>数据库: ㉓ 更新User表对应记录
数据库-->>前端成就页面: ㉔ 返回更新成功
前端成就页面->>用户: ㉕ 显示徽章解锁动画、积分奖励提示
前端成就页面->>用户: ㉖ 渲染徽章卡片（状态、进度条"5/10"、描述）
**_end_**

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
返回参数 [{"id": "badge_survey_10", "name": "问卷达人", "description": "完成 10 份问卷", "type": "survey_count", "requirement": 10, "points": 20, "icon": "🏆"}, ...]

接口名称 获取用户信息接口（含徽章数据）
接口描述 查询用户信息，包含已解锁徽章ID数组
URL {{baseurl}}/users/:id
method GET
请求参数 无
返回参数 {"id": "user_123", "username": "张三", "points": 350, "unlockedBadges": ["badge_survey_10", "badge_login_7"], "completedSurveys": [], "continuousLoginDays": 5, ...}

接口名称 更新用户徽章数据接口
接口描述 更新用户已解锁徽章和积分（前端徽章解锁时调用）
URL {{baseurl}}/users/:id
method PATCH
请求参数 {"unlockedBadges": ["badge_survey_10", "badge_login_7", "badge_create_5"], "points": 420}
返回参数 {"success": true, "data": {...}}

3、关键代码
代码 5-16 积分与成就徽章系统核心代码

// 获取积分历史 (userController.js)
exports.getPointHistory = async (req, res, next) => {
const { page = 1, limit = 20 } = req.query;
const history = await PointHistory.findAndCountAll({
where: { userId: req.params.id },
limit: parseInt(limit),
offset: (page - 1) \* limit,
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

// 前端检查并自动解锁徽章 (AchievementsPage.vue)
const checkAndUnlockBadges = async () => {
  try {
    const userId = userStore.userId;
    const newlyUnlocked = [];

    // 检查每个徽章的解锁条件
    for (const badge of allBadges.value) {
      // 如果已经解锁，跳过
      if (userUnlockedBadgeIds.value.includes(badge.id)) {
        continue;
      }

      // 根据徽章类型检查是否应该解锁
      const currentProgress = getCurrentProgress(badge);
      const shouldUnlock = currentProgress >= badge.requirement;

      if (shouldUnlock) {
        newlyUnlocked.push(badge);
        userUnlockedBadgeIds.value.push(badge.id);
      }
    }

    // 如果有新解锁的徽章，更新用户数据
    if (newlyUnlocked.length > 0) {
      // 计算新增的积分
      const addedPoints = newlyUnlocked.reduce((sum, badge) => sum + badge.points, 0);
      const newPoints = userStats.value.points + addedPoints;

      // 更新数据库中的用户数据
      await apiClient.patch(`/users/${userId}`, {
        unlockedBadges: userUnlockedBadgeIds.value,
        points: newPoints,
      });

      // 更新本地显示
      userStats.value.points = newPoints;

      // 显示解锁提示
      for (const badge of newlyUnlocked) {
        ElMessage.success({
          message: `🎉 恭喜解锁徽章：${badge.name}！获得 ${badge.points} 积分`,
          duration: 3000,
        });
      }
    }
  } catch (error) {
    console.error("检查徽章解锁失败:", error);
  }
};

// 获取当前进度 (AchievementsPage.vue)
const getCurrentProgress = (badge) => {
  switch (badge.type) {
    case "survey_count":
      return userStats.value.completedSurveys;
    case "create_count":
      return answerStats.value.createCount;
    case "continuous_login":
      return answerStats.value.continuousLoginDays;
    case "total_points":
      return userStats.value.points;
    // ... 其他徽章类型的进度计算
    default:
      return 0;
  }
};
