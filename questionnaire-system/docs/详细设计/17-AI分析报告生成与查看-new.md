AI分析报告生成与查看
1、简要描述
（1）功能描述：AI分析报告生成与查看功能为用户提供基于Coze AI平台的智能分析能力。用户完成问卷填写后，系统自动收集用户个人信息及答题数据，调用Coze AI工作流API进行深度分析，生成包含个性化建议、心理分析、行为洞察等内容的综合报告。

（2）代码逻辑：
用户完成问卷后点击"生成分析报告"按钮，前端把问卷ID、标题、分类和答案发送到后端。后端先验证参数完整性，然后查询用户的基本信息（昵称、年龄、性别、职业、城市、个人简介、兴趣标签等）。后端直接在数据库创建一条新的报告记录，状态标记为"生成中"。然后后端将用户信息和问卷信息、用户答案一起打包，调用Coze AI工作流API生成个性化报告。Coze API采用流式返回，后端将返回的内容完整拼接。生成完成后，更新数据库中的报告记录，将状态改为"已完成"，保存报告内容和生成时间，然后返回给前端显示。如果AI调用出错，将状态标记为"失败"并记录错误信息。查看报告时，前端发送报告ID到后端，后端验证该报告是否属于当前用户，然后从数据库读取报告内容及关联的问卷信息返回。获取报告列表时，支持分页和按状态筛选，按创建时间倒序返回，用户可以看到自己不同问卷的不同分析报告。


***时序图最新描述***
    用户->>前端答题结果页ResultPage.vue: ① 点击"生成分析报告"按钮
    前端答题结果页ResultPage.vue->>API层(report.js): ② 发送生成报告请求
    API层(report.js)->>后端路由(reports.js): ③ POST /reports/generate
    后端路由(reports.js)->>数据库: ④ 查询用户信息(User表)
    数据库-->>后端路由(reports.js): ⑤ 返回用户数据
    后端路由(reports.js)->>数据库: ⑥ 创建Report记录(status=generating)
    后端路由(reports.js)->>CozeAPI(cozeService.js): ⑦ 调用AI工作流API
    CozeAPI(cozeService.js)-->>后端路由(reports.js): ⑧ 流式返回分析内容
    后端路由(reports.js)->>数据库: ⑨ 更新Report(status=completed,content=报告)
    数据库-->>后端路由(reports.js): ⑩ 返回更新结果
    后端路由(reports.js)-->>前端答题结果页ResultPage.vue: ⑪ 返回报告ID及内容
    前端答题结果页ResultPage.vue->>用户: ⑫ 显示生成成功并展示报告
    
    用户->>前端报告列表页ReportsPage.vue: ⑬ 点击查看报告详情
    前端报告列表页ReportsPage.vue->>API层(report.js): ⑭ 发送查询报告请求
    API层(report.js)->>后端路由(reports.js): ⑮ GET /reports/:id
    后端路由(reports.js)->>数据库: ⑯ 查询Report记录(含Survey关联)
    数据库-->>后端路由(reports.js): ⑰ 返回报告数据及关联问卷
    后端路由(reports.js)-->>前端报告列表页ReportsPage.vue: ⑱ 返回报告详情
    前端报告列表页ReportsPage.vue->>用户: ⑲ 渲染报告内容
***end***


2、接口定义
表 5-17 AI分析报告接口表

接口名称 生成分析报告接口
接口描述 用户完成问卷后调用，生成新的个性化AI分析报告
URL {{baseurl}}/reports/generate
method POST
请求参数{
  "nickname": "张三",
  "bio": "热爱科技与创新，喜欢尝试新鲜事物",
  "city": "北京",
  "gender": "male",
  "age": 25,
  "profession": "软件工程师",
  "tags": ["科技爱好者", "阅读", "运动", "音乐"],
  "surveyTitle": "职场压力与心理健康调查",
  "answers": [
    {"text": "工作压力较大，经常需要加班","question": "您目前的工作压力状况如何？"},{ ...}
  ]
}
返回参数 {"success": true, "message": "报告生成成功", "data": {"reportId": 42, "status": "completed", "content": "## 个人心理健康分析报告...", "generatedAt": "2024-01-15T10:30:00.000Z"}}

接口名称 查询报告详情接口
接口描述 查询指定报告的详细内容，包含关联的问卷信息
URL {{baseurl}}/reports/:id
method GET
请求参数 路径参数: id（报告ID），header: Authorization (Bearer token)
返回参数 {"success": true, "data": {"id": 42, "userId": "USR001", "surveyId": "SV123", "title": "心理健康测评 - 个人分析报告", "content": "## 报告内容...", "status": "completed", "generatedAt": "2024-01-15T10:30:00.000Z", "survey": {"id": "SV123", "title": "心理健康测评", "category": "心理健康"}}}


3、关键代码
代码 5-17 AI分析报告生成核心代码

// 报告生成核心逻辑 (reports.js)
router.post("/generate", authenticate, async (req, res, next) => {
  const userId = req.user.id;
  const { surveyId, surveyTitle, answers, category } = req.body;

  // 获取用户信息
  const user = await User.findByPk(userId);

    // 创建报告记录
  const report = await Report.create({
    userId, surveyId,
    title: `${surveyTitle} - 个人分析报告`,
    surveyTitle, category: category || "",
    status: "generating",
  });

  try {
    // 调用Coze API生成报告
    const reportContent = await generatePersonalReport(
      { nickname: user.nickname, bio: user.bio, city: user.city,
        gender: user.gender, age: user.age, profession: user.profession,
        tags: user.tags || [] },
      { title: surveyTitle, category: category || "" },
      answers
    );

    // 更新报告
    report.content = reportContent;
    report.status = "completed";
    report.generatedAt = new Date();
    await report.save();

    res.json({ success: true, message: "报告生成成功",
      data: { reportId: report.id, status: "completed",
              content: reportContent, generatedAt: report.generatedAt } });
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
