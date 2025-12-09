问卷审核管理
1、简要描述
（1）功能描述：问卷审核管理功能用于管理员对用户提交的问卷进行审核，包括查看待审核问卷列表、审核通过（发布）、审核拒绝（驳回）等操作。用户创建问卷并提交审核后，问卷状态自动设置为"待审核"(pending)，管理员在后台审核页面可查看所有待审核问卷的详细信息，决定是否批准发布。

（2）代码逻辑：管理员在后台问卷管理页面点击"待审核"标签，前端调用问卷列表接口并传入status=pending筛选条件，后端返回所有待审核问卷。管理员点击某问卷的"审核"按钮，弹出审核对话框，可选择"通过"或"拒绝"并填写备注信息。前端调用 PUT /api/admin/surveys/:id/review 接口，传入审核决定(status参数，值为published或stopped/rejected)和可选的拒绝原因(reason)。后端控制器开启数据库事务，查询目标问卷记录并验证问卷存在性，若审核通过则更新问卷状态为published并设置publishedAt为当前时间（若之前未发布过），若审核拒绝则更新状态为stopped并可存储拒绝原因。更新操作成功后，在同一事务中创建AdminActivity日志记录包含审核操作详情，提交事务后返回成功响应给前端。前端更新问卷列表，将已审核的问卷从待审核列表移除并显示操作成功提示。

时序图描述
管理员 → 后台问卷管理页面: 访问待审核问卷列表
后台问卷管理页面 → surveyController: GET /api/surveys?status=pending
surveyController → MySQL: 查询status为pending的问卷
MySQL → surveyController: 返回待审核问卷列表
surveyController → 后台问卷管理页面: 返回问卷数据
后台问卷管理页面 → 管理员: 显示待审核问卷列表

管理员 → 审核对话框: 点击审核按钮，选择通过/拒绝
审核对话框 → adminController: PUT /api/admin/surveys/:id/review (status, reason)
adminController → MySQL: 开启数据库事务并查询目标问卷
MySQL → adminController: 返回问卷数据
adminController → MySQL: 更新问卷状态(published/stopped)和发布时间
adminController → MySQL: 创建AdminActivity日志记录
adminController → MySQL: 提交事务
adminController → 审核对话框: 返回审核成功响应
审核对话框 → 管理员: 显示审核成功提示

***时序图描述***
管理员 → 前端界面: 触发审核操作
前端界面 → 后端API: 调用审核接口
后端API → MySQL: 在事务中更新问卷状态和记录日志
MySQL → 后端API: 返回操作结果
后端API → 前端界面: 返回审核结果
前端界面 → 管理员: 显示审核提示
***end***


2、接口定义
表 5-21 问卷审核接口表

接口名称 问卷审核接口
接口描述 管理员审核问卷时调用，支持通过（发布）或拒绝（驳回）操作
URL {{baseurl}}/admin/surveys/:id/review
method PUT
请求参数 {"status": "published", "reason": "内容不符合规范"} (status为published或stopped，reason为可选拒绝原因)
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
