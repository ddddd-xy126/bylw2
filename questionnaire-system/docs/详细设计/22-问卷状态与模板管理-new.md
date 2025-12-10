问卷状态与模板管理
1、简要描述
（1）功能描述：管理员在后台管理问卷状态和模板属性，包括问卷上架(published)、下架(stopped)、设置为模板(isTemplate=true)、取消模板状态等操作。

（2）代码逻辑：管理员在后台问卷管理页面查看所有问卷，通过筛选器选择"模板"状态可查看当前所有模板问卷。管理员点击"下架"按钮时，前端调用 updateSurveyStatusApi 接口并传入 status="stopped"，后端更新数据库中的 status 字段为 stopped。管理员点击"上架"按钮时，调用同样接口传入 status="published"，后端更新 status 字段为 published。管理员点击"设为模板"按钮时，前端调用问卷接口更新 isTemplate=true，后端更新 isTemplate 字段，同时调用 recordAdminActivity 接口记录操作日志（包含管理员 ID、操作类型、问卷标题等信息）。管理员点击"取消模板"按钮时，调用同样接口更新 isTemplate=false。

时序图描述
管理员 → 后台问卷列表: 点击"上架"/"下架"/"设为模板"/"取消模板"按钮
后台问卷列表 → 后端 API: PUT /surveys/:id（status 或 isTemplate 字段）
后端 API → MySQL: 更新 status 或 isTemplate 字段
MySQL → 后端 API: 返回更新结果
后端 API → 后台问卷列表: 返回操作成功
后台问卷列表 → 后台问卷列表: 刷新问卷列表并显示操作成功提示

***时序图最新描述***
    管理员->>前端后台问卷列表: ① 点击"下架"按钮
    前端后台问卷列表->>API层(survey.js): ② 调用updateSurveyStatusApi接口
    API层(survey.js)->>后端路由(surveys.js): ③ PUT /surveys/:id (status="stopped")
    后端路由(surveys.js)->>控制器(surveyController.js): ④ 调用updateSurvey方法
    控制器(surveyController.js)->>数据库: ⑤ 更新Survey.status字段
    数据库-->>控制器(surveyController.js): ⑥ 返回更新结果
    控制器(surveyController.js)-->>前端后台问卷列表: ⑦ 返回操作成功
    前端后台问卷列表->>前端后台问卷列表: ⑧ 刷新问卷列表
    前端后台问卷列表->>管理员: ⑨ 显示"下架成功"提示
    管理员->>前端后台问卷列表: ⑩ 点击"设为模板"按钮
    前端后台问卷列表->>API层(survey.js): ⑪ 调用问卷更新接口
    API层(survey.js)->>后端路由(surveys.js): ⑫ PUT /surveys/:id (isTemplate=true)
    后端路由(surveys.js)->>控制器(surveyController.js): ⑬ 调用updateSurvey方法
    控制器(surveyController.js)->>数据库: ⑭ 更新Survey.isTemplate字段
    数据库-->>控制器(surveyController.js): ⑮ 返回更新结果
    控制器(surveyController.js)-->>前端后台问卷列表: ⑯ 返回操作成功
    前端后台问卷列表->>前端后台问卷列表: ⑰ 刷新问卷列表
    前端后台问卷列表->>管理员: ⑱ 显示"已设为模板"提示
***end***

2、接口定义
表 5-22 问卷状态与模板管理接口表

接口名称 更新问卷状态接口
接口描述 管理员更新问卷状态（上架/下架/是否为模板）
URL {{baseurl}}/surveys/:id
method PUT
请求参数 {"status": "published"} 或 {"isTemplate": true}
返回参数 {"success": true, "message": "更新成功", "data": {"id": "SV123", "title": "用户满意度调查", "status": "published"}}

3、关键代码
代码 5-22 问卷状态与模板管理核心代码

// 更新问卷状态或模板属性（QuestionnaireListPage.vue）
const offlineQuestionnaire = async (id) => {
await updateSurveyStatusApi(id, "stopped");
ElMessage.success("下架成功");
await loadQuestionnaires();
};

const onlineQuestionnaire = async (id) => {
await updateSurveyStatusApi(id, "published");
ElMessage.success("上架成功");
await loadQuestionnaires();
};

const setAsTemplate = async (id) => {
await apiClient.put(`/surveys/${id}`, { isTemplate: true });
ElMessage.success("已设为模板");
await loadQuestionnaires();
};

const removeTemplate = async (id) => {
await apiClient.put(`/surveys/${id}`, { isTemplate: false });
ElMessage.success("已取消模板状态");
await loadQuestionnaires();
};

// 后端更新问卷（surveyController.js）
exports.updateSurvey = async (req, res, next) => {
try {
const { id } = req.params;
const { status, isTemplate } = req.body;

    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({ success: false, message: "问卷不存在" });
    }

    await survey.update({
      status: status || survey.status,
      isTemplate: isTemplate !== undefined ? isTemplate : survey.isTemplate,
    });

    res.json({ success: true, message: "问卷更新成功", data: survey });

} catch (error) {
next(error);
}
};
