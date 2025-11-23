const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Report = require("../models/Report");
const User = require("../models/User");
const Survey = require("../models/Survey");
const { generatePersonalReport } = require("../services/cozeService");
const createPdf = require("../utils/createPdf");
const fs = require("fs");

/**
 * 生成个人分析报告
 * POST /api/reports/generate
 */
router.post("/generate", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { surveyId, surveyTitle, answers, category } = req.body;

    console.log("📥 收到报告生成请求:", {
      userId,
      surveyId,
      surveyTitle,
      category,
      answersCount: answers?.length,
    });

    if (!surveyId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "缺少必要参数：surveyId、surveyTitle 和 answers",
      });
    }

    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    console.log("👤 用户信息:", {
      username: user.username,
      nickname: user.nickname,
      age: user.age,
      gender: user.gender,
      profession: user.profession,
      city: user.city,
      bio: user.bio,
      tags: user.tags,
    });

    console.log("📝 用户答案:", {
      answersCount: answers.length,
      answers: answers,
    });

    // 检查是否已存在报告
    let report = await Report.findOne({
      where: { userId, surveyId },
    });

    if (report && report.status === "completed") {
      console.log("✅ 报告已存在，直接返回");
      return res.json({
        success: true,
        message: "报告已存在",
        data: report,
      });
    }

    // 创建或更新报告记录为"生成中"状态
    if (!report) {
      report = await Report.create({
        userId,
        surveyId,
        title: `${surveyTitle} - 个人分析报告`,
        surveyTitle: surveyTitle,
        category: category || "",
        content: "",
        status: "generating",
      });
    } else {
      report.status = "generating";
      report.content = "";
      await report.save();
    }

    console.log("🔄 报告记录已创建/更新，开始生成报告...");

    // 准备 Coze API 输入数据
    const cozeInputData = {
      nickname: user.nickname || user.username || "用户",
      bio: user.bio || "暂无简介",
      city: user.city || "未知",
      gender: user.gender || "unknown",
      age: parseInt(user.age) || 0,
      profession: user.profession || "未知",
      tags: Array.isArray(user.tags) ? user.tags : [],
      surveyTitle: surveyTitle || "问卷",
      answers: answers.map((ans) => ({
        text: ans.text !== undefined ? ans.text : ans.answer,
        question: ans.question || "",
      })),
    };

    console.log("📤 准备发送到 Coze API 的数据:");
    console.log(JSON.stringify(cozeInputData, null, 2));

    // 同步调用 Coze API 生成报告
    try {
      const reportContent = await generatePersonalReport(
        {
          username: user.username,
          nickname: user.nickname,
          bio: user.bio,
          city: user.city,
          gender: user.gender,
          age: user.age,
          profession: user.profession,
          tags: user.tags || [],
        },
        {
          title: surveyTitle,
          category: category || "",
        },
        answers
      );

      console.log("✅ Coze API 返回成功，报告长度:", reportContent.length);
      console.log("📄 报告内容预览:", reportContent.substring(0, 200) + "...");

      // 更新报告内容
      report.content = reportContent;
      report.status = "completed";
      report.generatedAt = new Date();
      await report.save();

      console.log("💾 报告已保存到数据库");

      res.json({
        success: true,
        message: "报告生成成功",
        data: {
          reportId: report.id,
          status: "completed",
          content: reportContent,
          generatedAt: report.generatedAt,
        },
      });
    } catch (error) {
      console.error("❌ Coze API 调用失败:", error);

      // 更新报告状态为失败
      report.status = "failed";
      report.content = `报告生成失败: ${error.message}`;
      await report.save();

      return res.status(500).json({
        success: false,
        message: "报告生成失败：" + error.message,
      });
    }
  } catch (error) {
    console.error("❌ 生成报告失败:", error);
    next(error);
  }
});

/**
 * 异步生成报告（后台执行）
 */
async function generateReportAsync(reportId, user, survey, answers) {
  try {
    // 调用 Coze API 生成报告
    const reportContent = await generatePersonalReport(
      {
        username: user.username,
        nickname: user.nickname,
        bio: user.bio,
        city: user.city,
        gender: user.gender,
        age: user.age,
        profession: user.profession,
        tags: user.tags || [],
      },
      {
        title: survey.title,
        category: survey.category,
      },
      answers
    );

    // 更新报告内容
    await Report.update(
      {
        content: reportContent,
        status: "completed",
        generatedAt: new Date(),
      },
      {
        where: { id: reportId },
      }
    );

    console.log(`报告 ${reportId} 生成成功`);
  } catch (error) {
    console.error(`报告 ${reportId} 生成失败:`, error);

    // 更新报告状态为失败
    await Report.update(
      {
        status: "failed",
        content: `报告生成失败: ${error.message}`,
      },
      {
        where: { id: reportId },
      }
    );
  }
}

/**
 * 获取报告状态
 * GET /api/reports/:id/status
 */
router.get("/:id/status", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      where: { id, userId },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "报告不存在",
      });
    }

    res.json({
      success: true,
      data: {
        id: report.id,
        status: report.status,
        generatedAt: report.generatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取报告详情
 * GET /api/reports/:id
 */
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      where: { id, userId },
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: ["id", "title", "category"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "报告不存在",
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取用户所有报告列表
 * GET /api/reports
 */
router.get("/", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Survey,
          as: "survey",
          attributes: ["id", "title", "category"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      success: true,
      data: {
        reports: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 下载报告
 * GET /api/reports/:id/download
 */
router.get("/:id/download", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      where: { id, userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "nickname"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "报告不存在",
      });
    }

    if (report.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "报告尚未生成完成",
      });
    }

    // 解析 content
    let contentText = report.content;
    try {
      const contentObj = JSON.parse(report.content);
      contentText = contentObj.output || report.content;
    } catch (e) {
      // 如果不是 JSON，直接使用原始内容
    }

    // 使用 createPdf 生成 PDF
    const pdfPath = await createPdf({
      title: report.title || "个人分析报告",
      subtitle: report.surveyTitle || "",
      nickname: report.user?.nickname || report.user?.username || "用户",
      surveyTitle: report.surveyTitle || "",
      generatedAt: new Date(report.generatedAt).toLocaleString("zh-CN", {
        hour12: false,
      }),
      content: contentText,
    });

    // 设置响应头
    const filename = `${report.title.replace(
      /[^\w\u4e00-\u9fa5]/g,
      "_"
    )}_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);

    stream.on("end", () => {
      // 删除临时文件
      try {
        fs.unlinkSync(pdfPath);
      } catch (e) {
        console.warn("删除临时 PDF 文件失败:", e.message);
      }
    });

    stream.on("error", (err) => {
      console.error("读取 PDF 文件失败:", err);
      res.status(500).send("PDF 下载失败");
    });
  } catch (error) {
    console.error("生成 PDF 失败:", error);
    next(error);
  }
});

/**
 * 删除报告
 * DELETE /api/reports/:id
 */
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      where: { id, userId },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "报告不存在",
      });
    }

    await report.destroy();

    res.json({
      success: true,
      message: "报告已删除",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
