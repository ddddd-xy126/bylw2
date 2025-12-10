分析报告PDF导出与删除
1、简要描述
（1）功能描述：分析报告PDF导出与删除功能为用户提供报告的持久化保存和管理能力。

（2）代码逻辑：用户在报告详情页点击“导出 PDF”时，前端调用 downloadReportApi(reportId) 发送 GET /api/reports/:id/download 请求。后端验证用户身份并根据报告 ID + 用户 ID 查询数据，若报告不存在、用户无权限或报告未完成，则返回 404。校验通过后解析报告内容并调用 createPdf() 工具函数生成 PDF 文件。该函数内部完成 PDF 文档对象创建、中文字体注册、标题与正文绘制，并将 PDF 写入临时目录。随后后端以文件流方式输出 PDF，同时设置下载相关的 HTTP 头部；流结束后自动删除临时文件。前端接收二进制流，创建 Blob URL 并触发浏览器自动下载。

删除报告时，前端通过确认后调用 DELETE /api/reports/:id。后端先校验用户身份并确认报告归属，再执行 report.destroy() 进行物理删除并返回成功提示。前端同步移除列表项并更新视图。

时序图描述
用户 → 前端界面：点击“导出 PDF”
前端界面 → 后端 API：GET /api/reports/:id/download
后端 API → MySQL：查询报告并验证所属权
MySQL → 后端 API：返回报告数据

alt 报告不存在或未完成
  后端 API → 前端界面：返回 404
else 报告可导出
  后端 API → PDFKit：调用 createPdf() 生成 PDF 文件
  PDFKit → 临时目录：写入 PDF
  后端 API → 前端界面：发送文件流 (application/pdf)
  前端界面 → 浏览器：创建 blob URL 并触发下载
  后端 API → 临时目录：删除 PDF
end

用户 → 前端界面：点击“删除报告”
前端界面 → 用户：确认弹窗
用户 → 前端界面：确认删除
前端界面 → 后端 API：DELETE /api/reports/:id
后端 API → MySQL：查询报告并验证所属权
MySQL → 后端 API：返回报告信息
后端 API → MySQL：执行物理删除
后端 API → 前端界面：返回删除成功
前端界面 → 用户：显示提示并更新列表

***时序图描述***
用户 → 前端界面: 触发PDF导出/删除操作
前端界面 → 后端API: 调用对应接口
后端API → MySQL/PDFKit: 查询报告并生成PDF或执行删除
MySQL/PDFKit → 后端API: 返回操作结果
后端API → 前端界面: 返回文件流或删除结果
前端界面 → 用户: 下载PDF或显示删除提示
***end***

***时序图最新描述***
    用户->>前端报告详情页: ① 点击"导出PDF"按钮
    前端报告详情页->>API层(report.js): ② 调用PDF导出接口
    API层(report.js)->>后端路由(reports.js): ③ GET /reports/:id/download
    后端路由(reports.js)->>数据库: ④ 查询Report记录并验证所属权
    数据库-->>后端路由(reports.js): ⑤ 返回报告数据
    后端路由(reports.js)->>工具层(createPdf.js): ⑥ 调用PDF生成函数
    工具层(createPdf.js)->>临时目录: ⑦ 使用PDFKit创建PDF文件
    工具层(createPdf.js)-->>后端路由(reports.js): ⑧ 返回文件路径
    后端路由(reports.js)-->>前端报告详情页: ⑨ 发送PDF文件流(application/pdf)
    前端报告详情页->>浏览器: ⑩ 创建blob URL并触发下载
    后端路由(reports.js)->>临时目录: ⑪ 删除临时PDF文件
    用户->>前端报告列表页: ⑫ 点击"删除报告"按钮
    前端报告列表页->>用户: ⑬ 弹出确认对话框
    用户->>前端报告列表页: ⑭ 确认删除
    前端报告列表页->>API层(report.js): ⑮ 调用删除报告接口
    API层(report.js)->>后端路由(reports.js): ⑯ DELETE /reports/:id
    后端路由(reports.js)->>数据库: ⑰ 查询Report记录并验证所属权
    数据库-->>后端路由(reports.js): ⑱ 返回报告信息
    后端路由(reports.js)->>数据库: ⑲ 执行物理删除
    数据库-->>后端路由(reports.js): ⑳ 返回删除结果
    后端路由(reports.js)-->>前端报告列表页: ㉑ 返回删除成功
    前端报告列表页->>用户: ㉒ 显示提示并更新列表
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
// 导出报告 PDF (reports.js)
router.get("/:id/download", authenticate, async (req, res) => {
  const report = await Report.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!report || report.status !== "completed") {
    return res.status(404).json({ success: false, message: "报告不存在或未完成" });
  }

  const pdfPath = await createPdf({
    title: report.title,
    content: report.content,
    generatedAt: new Date(report.generatedAt).toLocaleString("zh-CN"),
  });

  res.setHeader("Content-Type", "application/pdf");
  const stream = fs.createReadStream(pdfPath);
  stream.pipe(res);
  stream.on("end", () => fs.unlinkSync(pdfPath));
});

// 删除报告 (reports.js)
router.delete("/:id", authenticate, async (req, res) => {
  const report = await Report.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!report) {
    return res.status(404).json({ success: false, message: "报告不存在" });
  }

  await report.destroy();
  res.json({ success: true, message: "报告已删除" });
});










// PDF生成工具函数 (pdfUtils.js)
const createPdf = async ({ title, content, generatedAt }) => {
    const doc = new PDFDocument();
    const tempPath = path.join(os.tmpdir(), `report_${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(tempPath);
    doc.pipe(writeStream);
    
    // 注册中文字体
    doc.registerFont("NotoSansSC", path.join(__dirname, "fonts/NotoSansSC-Regular.otf"));
    
    // 标题
    doc.font("NotoSansSC").fontSize(20).text(title, { align: "center" });
    doc.moveDown();
    
    // 生成时间
    doc.fontSize(10).fillColor("gray").text(`生成时间: ${generatedAt}`, { align: "right" });
    doc.moveDown();
    
    // 正文内容
    doc.fontSize(12).fillColor("black").text(content, {
        align: "left",
        indent: 20,
        height: 300,
        ellipsis: true
    });
    
    doc.end();
    
    return new Promise((resolve, reject) => {
        writeStream.on("finish", () => resolve(tempPath));
        writeStream.on("error", reject);
    });
    };
