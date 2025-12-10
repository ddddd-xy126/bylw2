问卷审核管理
1、简要描述
（1）功能描述：主要用于管理员对用户提交的问卷进行审核。

（2）代码逻辑：管理员进入待审核问卷页面，前端调用问卷列表接口并传入 status=pending 筛选条件，后端返回所有待审核问卷。管理员点击某问卷的"审核"按钮，弹出审核对话框，可选择"通过"或"拒绝"并填写备注信息。前端调用 PUT /api/admin/surveys/:id/review 接口，传入审核决定(status 参数，值为 published 或 stopped/rejected)和可选的拒绝原因(reason)。后端控制器开启数据库，查询目标问卷记录并验证问卷存在性，若审核通过则更新问卷状态为 published 并设置 publishedAt 为当前时间，若审核拒绝则更新状态为 stopped 并可存储拒绝原因。

时序图描述
管理员 → 后台问卷管理页面: 访问待审核问卷列表
后台问卷管理页面 → surveyController: GET /api/surveys?status=pending
surveyController → MySQL: 查询 status 为 pending 的问卷
MySQL → surveyController: 返回待审核问卷列表
surveyController → 后台问卷管理页面: 返回问卷数据
后台问卷管理页面 → 管理员: 显示待审核问卷列表

管理员 → 审核对话框: 点击审核按钮，选择通过/拒绝
审核对话框 → adminController: PUT /api/admin/surveys/:id/review (status, reason)
adminController → MySQL: 开启数据库事务并查询目标问卷
MySQL → adminController: 返回问卷数据
adminController → MySQL: 更新问卷状态(published/stopped)和发布时间
adminController → MySQL: 创建 AdminActivity 日志记录
adminController → MySQL: 提交事务
adminController → 审核对话框: 返回审核成功响应
审核对话框 → 管理员: 显示审核成功提示

**_时序图描述_**
管理员 → 前端界面: 触发审核操作
前端界面 → 后端 API: 调用审核接口
后端 API → MySQL: 在事务中更新问卷状态和记录日志
MySQL → 后端 API: 返回操作结果
后端 API → 前端界面: 返回审核结果
前端界面 → 管理员: 显示审核提示
**_end_**

***时序图最新描述***
    管理员->>前端审核对话框: ① 点击"通过"或"拒绝"按钮
    前端审核对话框->>API层(admin.js): ② 调用审核问卷接口
    API层(admin.js)->>后端路由(admin.js): ③ PUT /admin/surveys/:id/review
    后端路由(admin.js)->>控制器(adminController.js): ④ 调用reviewSurvey方法
    控制器(adminController.js)->>数据库: ⑤ 开启数据库事务
    控制器(adminController.js)->>数据库: ⑥ 查询Survey记录
    数据库-->>控制器(adminController.js): ⑦ 返回问卷数据
    控制器(adminController.js)->>数据库: ⑧ 更新status字段(published/rejected)
    控制器(adminController.js)->>数据库: ⑨ 创建AdminActivity日志记录
    控制器(adminController.js)->>数据库: ⑩ 提交事务
    数据库-->>控制器(adminController.js): ⑪ 返回操作结果
    控制器(adminController.js)-->>前端审核对话框: ⑫ 返回审核成功响应
    前端审核对话框->>管理员: ⑬ 显示审核成功提示
***end***

2、接口定义
表 5-21 问卷审核接口表

接口名称 问卷审核接口
接口描述 管理员审核问卷时调用，支持通过（发布）或拒绝（驳回）操作
URL {{baseurl}}/admin/surveys/:id/review
method PUT
请求参数 {"status": "published", "reason": "内容不符合规范"} (status 为 published 或 stopped，reason 为可选拒绝原因)
返回参数 {"success": true, "message": "问卷审核成功", "data": {"id": "SV123", "title": "用户满意度调查", "status": "published", "publishedAt": "2024-03-15T10:30:00Z"}}

3、关键代码
代码 5-21 问卷审核管理核心代码

// 审核问卷 (adminController.js)
exports.reviewSurvey = async (req, res, next) => {
const t = await sequelize.transaction();

try {
const { id } = req.params;
const { status, reason } = req.body; // status: 'published' or 'stopped'

    const survey = await Survey.findByPk(id);

    if (!survey) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "问卷不存在" });
    }

    // 更新问卷状态，若审核通过且之前未发布则设置发布时间
    await survey.update(
      {
        status,
        ...(status === "published" &&
          !survey.publishedAt && { publishedAt: new Date() }),
      },
      { transaction: t }
    );

    // 记录管理员活动日志
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
