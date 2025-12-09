分析报告PDF导出与删除
1、简要描述
（1）功能描述：分析报告PDF导出与删除功能为用户提供报告的持久化保存和管理能力。用户可以将已生成的AI分析报告导出为PDF格式文件，便于离线阅读、打印或分享。系统通过PDFKit库动态生成包含报告标题、用户信息、生成时间及完整报告内容的专业格式PDF文档，支持中文字体渲染。

（2）代码逻辑：用户在报告详情页点击"导出PDF"按钮，前端调用 downloadReportApi(reportId) 发起 GET /api/reports/:id/download 请求。后端验证用户身份并查询报告记录，验证所属权（userId匹配），检查报告状态（必须为"completed"），解析报告内容（若为JSON格式提取output字段），调用 createPdf() 工具函数生成PDF文件（创建PDFDocument实例、注册中文字体、绘制标题和报告内容、保存至临时目录）。后端设置HTTP响应头（Content-Type为application/pdf，Content-Disposition为attachment），通过文件流读取PDF并管道传输至响应，传输完成后删除临时文件。前端接收blob数据流，创建临时URL并动态创建`<a>`标签触发下载。删除功能通过 DELETE /api/reports/:id 接口实现，后端验证用户身份和所属权后执行 report.destroy() 物理删除，前端从报告列表中移除该项并显示成功提示。

时序图描述
用户 → 前端: 点击"导出PDF"按钮
前端 → 后端: GET /api/reports/:id/download
后端 → MySQL: 查询报告记录并验证所属权
MySQL → 后端: 返回报告数据

alt 报告不存在或无权限
    后端 → 前端: 404 报告不存在
else 报告存在且有权限
    后端 → PDFKit: 调用createPdf() 生成PDF文件
    PDFKit → 临时目录: 保存PDF文件
    后端 → 前端: 文件流响应 (Content-Type: application/pdf)
    前端 → 浏览器: 创建blob URL触发下载
    后端 → 临时目录: 删除临时PDF文件
end

用户 → 前端: 点击"删除报告"按钮
前端 → 用户: 弹出确认对话框
用户 → 前端: 确认删除
前端 → 后端: DELETE /api/reports/:id
后端 → MySQL: 查询报告记录并验证所属权
MySQL → 后端: 返回报告记录
后端 → MySQL: 执行删除操作 (report.destroy())
MySQL → 后端: 删除成功
后端 → 前端: 200 报告已删除
前端 → 用户: 显示删除成功提示

***时序图描述***
用户 → 前端界面: 触发PDF导出/删除操作
前端界面 → 后端API: 调用对应接口
后端API → MySQL/PDFKit: 查询报告并生成PDF或执行删除
MySQL/PDFKit → 后端API: 返回操作结果
后端API → 前端界面: 返回文件流或删除结果
前端界面 → 用户: 下载PDF或显示删除提示
***end***


2、接口定义
表 5-18 分析报告PDF导出与删除接口表

接口名称 导出报告PDF接口
接口描述 将指定报告导出为PDF文件下载
URL {{baseurl}}/reports/:id/download
method GET
请求参数 路径参数: id（报告ID）
返回参数 PDF文件流（二进制数据），Content-Type: application/pdf

接口名称 删除报告接口
接口描述 物理删除指定报告记录
URL {{baseurl}}/reports/:id
method DELETE
请求参数 路径参数: id（报告ID）
返回参数 {"success": true, "message": "报告已删除"}

3、关键代码
代码 5-18 分析报告PDF导出与删除核心代码

// PDF导出接口 (reports.js)
router.get("/:id/download", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({
      where: { id, userId },
      include: [{ model: User, as: "user", attributes: ["username", "nickname"] }],
    });

    if (!report) return res.status(404).json({ success: false, message: "报告不存在" });
    if (report.status !== "completed") {
      return res.status(400).json({ success: false, message: "报告尚未生成完成" });
    }

    // 解析报告内容
    let contentText = report.content;
    try {
      const contentObj = JSON.parse(report.content);
      contentText = contentObj.output || report.content;
    } catch (e) {}

    // 生成PDF文件
    const pdfPath = await createPdf({
      title: report.title || "个人分析报告",
      subtitle: report.surveyTitle || "",
      nickname: report.user?.nickname || report.user?.username || "用户",
      generatedAt: new Date(report.generatedAt).toLocaleString("zh-CN", { hour12: false }),
      content: contentText,
    });

    // 设置响应头并传输文件
    const filename = `${report.title.replace(/[^\w\u4e00-\u9fa5]/g, "_")}_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);

    stream.on("end", () => {
      try {
        fs.unlinkSync(pdfPath);
      } catch (e) {
        console.warn("删除临时PDF文件失败:", e.message);
      }
    });
  } catch (error) {
    next(error);
  }
});

// 报告删除接口 (reports.js)
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const report = await Report.findOne({ where: { id, userId } });
    if (!report) {
      return res.status(404).json({ success: false, message: "报告不存在" });
    }

    await report.destroy();
    res.json({ success: true, message: "报告已删除" });
  } catch (error) {
    next(error);
  }
});

// PDF生成工具 (createPdf.js 核心片段)
function createPdf(report = {}) {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `report_${Date.now()}.pdf`;
      const tmpDir = path.join(__dirname, "../tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const filePath = path.join(tmpDir, fileName);

      const doc = new PDFDocument({
        size: "A4", margin: 48,
        info: { Title: report.title || "个人分析报告", Author: "系统生成" },
      });

      // 注册中文字体
      const fontPath = "C:\\Windows\\Fonts\\msyh.ttc";
      if (fs.existsSync(fontPath)) {
        doc.registerFont("ChineseFont", fontPath);
        doc.font("ChineseFont");
      }

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // 绘制标题
      doc.fontSize(24).fillColor("#303133")
         .text(report.title || "个人分析报告", { align: "center" });
      doc.moveDown(0.5);

      // 绘制副标题和元信息
      doc.fontSize(14).fillColor("#606266")
         .text(report.subtitle || "", { align: "center" });
      doc.moveDown(1.5);
      doc.fontSize(10).fillColor("#909399")
         .text(`生成时间: ${report.generatedAt}`, { align: "left" });

      // 渲染报告内容
      const cleanContent = removeMarkdown(report.content || "");
      doc.moveDown(1);
      doc.fontSize(12).fillColor("#303133")
         .text(cleanContent, { align: "left", lineGap: 4 });

      doc.end();

      writeStream.on("finish", () => resolve(filePath));
      writeStream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}
