const { CozeAPI } = require("@coze/api");

// Coze API 配置
const COZE_CONFIG = {
  token: "pat_m7jRFZhTeYnuqaTMXybSrwYSFyESKsddPY6rt1eMJ1C2bUGIFEtwlRTqrwAa1J3v",
  baseURL: "https://api.coze.cn",
  workflowId: "7553193807606693928",
};

// 创建 Coze API 客户端
const apiClient = new CozeAPI({
  token: COZE_CONFIG.token,
  baseURL: COZE_CONFIG.baseURL,
});

/**
 * 生成个人分析报告
 * @param {Object} userData - 用户信息
 * @param {Object} surveyData - 问卷信息
 * @param {Array} answers - 用户回答
 * @returns {Promise<string>} - 分析报告内容
 */
async function generatePersonalReport(userData, surveyData, answers) {
  try {
    // 组合输入数据 - 与 Coze 工作流示例格式保持一致
    const inputData = {
      nickname: userData.username || userData.nickname || "用户",
      bio: userData.bio || "暂无简介",
      city: userData.city || "未知",
      gender: userData.gender || "unknown",
      age: parseInt(userData.age) || 0,
      profession: userData.profession || "未知",
      tags: Array.isArray(userData.tags) ? userData.tags : [],
      surveyTitle: surveyData.title || "问卷",
      answers: answers.map((answer) => {
        const answerText =
          answer.text !== undefined ? answer.text : answer.answer;
        return {
          text: answerText,
          question: answer.question || "",
        };
      }),
    };

    console.log("调用 Coze API，输入数据:", JSON.stringify(inputData, null, 2));

    // 调用 Coze 工作流 API (流式)
    const stream = await apiClient.workflows.runs.stream({
      workflow_id: COZE_CONFIG.workflowId,
      parameters: {
        input: JSON.stringify(inputData),
      },
    });

    // 收集流式响应
    let reportContent = "";

    console.log("📡 开始接收 Coze 流式响应...");

    for await (const chunk of stream) {
      console.log("📦 收到数据块:", JSON.stringify(chunk, null, 2));

      const event = chunk.event;

      // 根据 Coze API 文档,event 类型包括: Message, Error, Done, Interrupt
      if (event === "Message") {
        // Message 事件 - 工作流节点输出消息
        // 正确的字段路径：chunk.data.content
        const content = chunk.data?.content;
        if (content) {
          console.log("✅ 收到内容:", content);
          reportContent += content;
        }
      } else if (event === "Error") {
        // Error 事件 - 报错
        console.error("❌ Coze API 错误:", {
          error_code: chunk.data?.error_code,
          error_message: chunk.data?.error_message,
          msg: chunk.msg,
        });
        throw new Error(
          chunk.data?.error_message || chunk.msg || "Coze API 调用失败"
        );
      } else if (event === "Interrupt") {
        // Interrupt 事件 - 工作流中断
        console.warn("⚠️ 工作流中断:", chunk.data);
        throw new Error("工作流执行被中断");
      } else if (event === "Done") {
        // Done 事件 - 工作流执行结束
        console.log("🎉 工作流执行完成");
        break;
      }
    }

    console.log("📊 报告内容收集完成，总长度:", reportContent.length);

    if (!reportContent) {
      throw new Error("未能生成报告内容");
    }

    console.log("报告生成成功，长度:", reportContent.length);
    return reportContent;
  } catch (error) {
    console.error("生成报告失败:", error);
    throw new Error("生成分析报告失败: " + error.message);
  }
}

/**
 * 生成个人分析报告（非流式，备用方案）
 */
async function generatePersonalReportSync(userData, surveyData, answers) {
  try {
    const inputData = {
      nickname: userData.username || userData.nickname || "用户",
      bio: userData.bio || "暂无简介",
      city: userData.city || "未知",
      gender: userData.gender || "unknown",
      age: userData.age || 0,
      profession: userData.profession || "未知",
      tags: userData.tags || [],
      surveyTitle: surveyData.title || "问卷",
      answers: answers.map((answer) => ({
        text: answer.text || answer.answer,
        question: answer.question,
      })),
    };

    console.log(
      "调用 Coze API (非流式)，输入数据:",
      JSON.stringify(inputData, null, 2)
    );

    // 调用 Coze 工作流 API (非流式)
    const result = await apiClient.workflows.runs.create({
      workflow_id: COZE_CONFIG.workflowId,
      parameters: {
        input: JSON.stringify(inputData),
      },
    });

    // 提取报告内容
    let reportContent = "";
    if (result.data && result.data.output) {
      reportContent = result.data.output;
    } else if (result.output) {
      reportContent = result.output;
    }

    if (!reportContent) {
      throw new Error("未能生成报告内容");
    }

    console.log("报告生成成功 (非流式)，长度:", reportContent.length);
    return reportContent;
  } catch (error) {
    console.error("生成报告失败 (非流式):", error);
    throw new Error("生成分析报告失败: " + error.message);
  }
}

module.exports = {
  generatePersonalReport,
  generatePersonalReportSync,
};
