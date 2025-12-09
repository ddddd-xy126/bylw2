AI分析报告生成与查看
1、简要描述
（1）功能描述：AI分析报告生成与查看功能为用户提供基于Coze AI平台的智能分析能力。用户完成问卷填写后，系统自动收集用户个人信息及答题数据，调用Coze AI工作流API进行深度分析，生成包含个性化建议、心理分析、行为洞察等内容的综合报告。

（2）代码逻辑：用户完成问卷后点击"生成分析报告"，前端收集问卷ID、标题、答案数组调用 POST /api/reports/generate 接口。后端查询用户详细信息（username、age、gender、profession、tags等），检查数据库中是否已存在该用户-问卷组合的报告，若存在且状态为"已完成"则直接返回，若不存在则创建新报告记录（状态设为"生成中"）。后端组装Coze API输入数据（用户画像 + 问卷答案），调用 cozeService.generatePersonalReport() 发起流式请求，实时接收Coze流式响应并拼接完整报告内容，完成后更新报告记录（status=completed, content=报告文本, generatedAt=当前时间）并返回给前端。若AI调用失败则更新报告状态为"failed"并记录错误信息。查看报告时，前端调用 GET /api/reports/:id 接口，后端验证报告所属权（userId匹配）后从数据库读取报告内容并返回，无需重复调用AI服务。

时序图描述
用户 → 前端: 点击"生成分析报告"
前端 → 后端: POST /api/reports/generate (surveyId, answers)
后端 → MySQL: 查询用户信息并检查是否已有报告
MySQL → 后端: 返回查询结果

alt 报告已存在且完成
    后端 → 前端: 返回已有报告数据
else 报告不存在或未完成
    后端 → MySQL: 创建/更新报告记录 (status=generating)
    后端 → CozeAPI: 调用工作流API (流式请求)
    CozeAPI → 后端: 流式返回分析内容
    后端 → MySQL: 更新报告 (status=completed, content=报告文本)
    后端 → 前端: 返回报告ID及内容
end

用户 → 前端: 点击查看报告详情
前端 → 后端: GET /api/reports/:id
后端 → MySQL: 查询报告记录 (where id and userId)
MySQL → 后端: 返回报告数据
后端 → 前端: 返回报告详情
前端 → 用户: 渲染报告内容

***时序图描述***
用户 → 前端界面: 触发生成/查看报告操作
前端界面 → 后端API: 调用对应接口
后端API → MySQL/CozeAPI: 查询/生成报告内容
MySQL/CozeAPI → 后端API: 返回操作结果
后端API → 前端界面: 返回报告数据
前端界面 → 用户: 显示报告内容
***end***


2、接口定义
表 5-17 AI分析报告接口表

接口名称 生成分析报告接口
接口描述 用户完成问卷后调用，生成个性化AI分析报告
URL {{baseurl}}/reports/generate
method POST
请求参数 {"surveyId": "SV123", "surveyTitle": "心理健康测评", "category": "心理健康", "answers": [{"question": "...", "answer": "..."}]}
返回参数 {"success": true, "message": "报告生成成功", "data": {"reportId": 42, "status": "completed", "content": "## 个人心理健康分析报告...", "generatedAt": "..."}}

接口名称 查询报告详情接口
接口描述 查询指定报告的详细内容
URL {{baseurl}}/reports/:id
method GET
请求参数 路径参数: id（报告ID）
返回参数 {"success": true, "data": {"id": 42, "userId": "USR001", "title": "...", "content": "...", "status": "completed", "generatedAt": "...", "survey": {...}}}

接口名称 获取报告列表接口
接口描述 查询用户所有历史报告列表
URL {{baseurl}}/reports?page=1&limit=10&status=completed
method GET
请求参数 {"page": 1, "limit": 10, "status": "completed"} (可选)
返回参数 {"success": true, "data": {"reports": [{"id": 42, "title": "...", "status": "completed", "generatedAt": "..."}], "total": 15, "page": 1, "totalPages": 2}}

3、关键代码
代码 5-17 AI分析报告生成核心代码

// 报告生成核心逻辑 (reports.js)
router.post("/generate", authenticate, async (req, res, next) => {
  const userId = req.user.id;
  const { surveyId, surveyTitle, answers } = req.body;

  const user = await User.findByPk(userId);
  let report = await Report.findOne({ where: { userId, surveyId } });
  
  if (report && report.status === "completed") {
    return res.json({ success: true, message: "报告已存在", data: report });
  }

  if (!report) {
    report = await Report.create({
      userId, surveyId, title: `${surveyTitle} - 个人分析报告`,
      status: "generating",
    });
  }

  try {
    const reportContent = await generatePersonalReport(
      { username: user.username, age: user.age, tags: user.tags },
      { title: surveyTitle },
      answers
    );

    report.content = reportContent;
    report.status = "completed";
    report.generatedAt = new Date();
    await report.save();

    res.json({ success: true, data: { reportId: report.id, content: reportContent } });
  } catch (error) {
    report.status = "failed";
    await report.save();
    res.status(500).json({ success: false, message: "报告生成失败" });
  }
});

// Coze AI流式调用 (cozeService.js)
async function generatePersonalReport(userData, surveyData, answers) {
  const stream = await apiClient.workflows.runs.stream({
    workflow_id: COZE_CONFIG.workflowId,
    parameters: { input: JSON.stringify({ ...userData, ...surveyData, answers }) },
  });

  let reportContent = "";
  for await (const chunk of stream) {
    if (chunk.event === "Message") {
      reportContent += chunk.data?.content || "";
    } else if (chunk.event === "Error") {
      throw new Error("Coze API 调用失败");
    }
  }
  return reportContent;
}
