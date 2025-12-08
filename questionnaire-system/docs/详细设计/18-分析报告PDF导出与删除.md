# 18 - 分析报告PDF导出与删除

## 功能描述

分析报告PDF导出与删除功能为用户提供报告的持久化保存和管理能力。用户可以将已生成的AI分析报告导出为PDF格式文件，便于离线阅读、打印或分享。系统通过PDFKit库动态生成包含报告标题、用户信息、生成时间及完整报告内容的专业格式PDF文档，支持中文字体渲染，并自动处理Markdown标记清理，确保文档美观可读。

删除功能允许用户移除不再需要的历史报告记录，系统会进行权限校验，确保用户只能删除自己的报告。删除操作为物理删除，直接从数据库中移除记录，释放存储空间。

**核心特性：**
- PDF动态生成：基于PDFKit库，支持A4纸张、中文字体、自定义主题配色
- Markdown清理：自动移除报告内容中的Markdown标记和Emoji表情，转换为纯文本
- 文件流式下载：通过HTTP响应流传输PDF，完成后自动删除临时文件
- 权限验证：确保用户只能导出和删除自己的报告
- 报告删除：物理删除数据库记录，同步更新前端列表

---

## 代码逻辑

### 1. PDF导出流程

**前端发起下载请求：**
1. 用户在报告详情页点击"导出PDF"按钮
2. 前端调用 `downloadReportApi(reportId)`
3. 发起 `GET /api/reports/:id/download` 请求（Fetch API，blob响应）

**后端生成PDF：**
1. 验证用户身份（JWT认证）
2. 查询报告记录，验证所属权（userId匹配）
3. 检查报告状态（必须为"completed"）
4. 解析报告内容（若为JSON格式提取output字段）
5. 调用 `createPdf()` 工具函数生成PDF文件
   - 创建PDFDocument实例（A4规格）
   - 注册中文字体（优先使用微软雅黑msyh.ttc）
   - 绘制报告标题、副标题（问卷名称）
   - 添加元信息：用户昵称、生成时间
   - 渲染报告正文内容（自动移除Markdown标记）
   - 保存至临时目录（server/tmp/）
6. 设置HTTP响应头：Content-Type为application/pdf，Content-Disposition为attachment
7. 通过文件流读取PDF并管道传输至响应
8. 传输完成后删除临时文件

**前端处理下载：**
1. 接收blob数据流
2. 创建临时URL（URL.createObjectURL）
3. 动态创建`<a>`标签触发下载
4. 清理临时资源

### 2. 报告删除流程

**前端发起删除请求：**
1. 用户在报告列表点击"删除"按钮
2. 弹出确认对话框
3. 确认后调用 `deleteReportApi(reportId)`
4. 发起 `DELETE /api/reports/:id` 请求

**后端处理删除：**
1. 验证用户身份（JWT认证）
2. 查询报告记录，验证所属权（userId匹配）
3. 若报告不存在，返回404错误
4. 执行物理删除：`report.destroy()`
5. 返回删除成功响应

**前端更新界面：**
1. 接收删除成功响应
2. 从报告列表中移除该项
3. 显示成功提示消息

---

## 时序图描述

### PDF导出时序图

```
用户 → 前端: 点击"导出PDF"按钮
前端 → 后端: GET /api/reports/:id/download (携带JWT token)
后端 → 数据库: 查询报告记录 (Report.findOne where id and userId)
数据库 → 后端: 返回报告数据 (content, title, surveyTitle, generatedAt)

alt 报告不存在或无权限
    后端 → 前端: 404 报告不存在
    前端 → 用户: 提示错误信息
else 报告存在且有权限
    alt 报告状态未完成
        后端 → 前端: 400 报告尚未生成完成
        前端 → 用户: 提示等待生成完成
    else 报告已完成
        后端 → PDFKit: 调用createPdf() 生成PDF文件
        PDFKit → PDFKit: 注册中文字体 (msyh.ttc)
        PDFKit → PDFKit: 创建文档页面 (A4)
        PDFKit → PDFKit: 绘制标题、用户信息、时间
        PDFKit → PDFKit: 渲染报告内容 (移除Markdown)
        PDFKit → 临时目录: 保存PDF文件 (server/tmp/)
        临时目录 → 后端: 返回文件路径
        后端 → 前端: 文件流响应 (Content-Type: application/pdf)
        前端 → 浏览器: 创建blob URL触发下载
        浏览器 → 用户: 保存PDF文件
        后端 → 临时目录: 删除临时PDF文件
    end
end
```

### 报告删除时序图

```
用户 → 前端: 点击"删除报告"按钮
前端 → 用户: 弹出确认对话框
用户 → 前端: 确认删除
前端 → 后端: DELETE /api/reports/:id (携带JWT token)
后端 → 数据库: 查询报告记录 (Report.findOne where id and userId)
数据库 → 后端: 返回报告记录

alt 报告不存在或无权限
    后端 → 前端: 404 报告不存在
    前端 → 用户: 提示错误信息
else 报告存在且有权限
    后端 → 数据库: 执行删除操作 (report.destroy())
    数据库 → 后端: 删除成功
    后端 → 前端: 200 报告已删除
    前端 → 前端: 从列表中移除该项
    前端 → 用户: 显示删除成功提示
end
```

---

## 接口定义

### 1. 导出报告PDF

**接口路径：** `GET /api/reports/:id/download`

**请求头：**
```json
{
  "Authorization": "Bearer <token>"
}
```

**路径参数：**
- `id`: 报告ID

**响应头：**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="心理健康测评问卷_个人分析报告_1710495000000.pdf"
```

**响应：** PDF文件流（二进制数据）

**错误响应示例：**
```json
{
  "success": false,
  "message": "报告不存在"
}
```
```json
{
  "success": false,
  "message": "报告尚未生成完成"
}
```

---

### 2. 删除报告

**接口路径：** `DELETE /api/reports/:id`

**请求头：**
```json
{
  "Authorization": "Bearer <token>"
}
```

**路径参数：**
- `id`: 报告ID

**响应示例（成功）：**
```json
{
  "success": true,
  "message": "报告已删除"
}
```

**响应示例（失败）：**
```json
{
  "success": false,
  "message": "报告不存在"
}
```

---

## 关键代码

### 后端：PDF导出接口 (server/routes/reports.js)

```javascript
router.get("/:id/download", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查询报告记录
    const report = await Report.findOne({
      where: { id, userId },
      include: [{ model: User, as: "user", attributes: ["username", "nickname"] }],
    });

    if (!report) {
      return res.status(404).json({ success: false, message: "报告不存在" });
    }

    if (report.status !== "completed") {
      return res.status(400).json({ success: false, message: "报告尚未生成完成" });
    }

    // 解析报告内容（处理JSON格式）
    let contentText = report.content;
    try {
      const contentObj = JSON.parse(report.content);
      contentText = contentObj.output || report.content;
    } catch (e) {
      // 直接使用原始内容
    }

    // 生成PDF文件
    const pdfPath = await createPdf({
      title: report.title || "个人分析报告",
      subtitle: report.surveyTitle || "",
      nickname: report.user?.nickname || report.user?.username || "用户",
      surveyTitle: report.surveyTitle || "",
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
        fs.unlinkSync(pdfPath); // 删除临时文件
      } catch (e) {
        console.warn("删除临时PDF文件失败:", e.message);
      }
    });
  } catch (error) {
    next(error);
  }
});
```

### 后端：报告删除接口 (server/routes/reports.js)

```javascript
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
```

### 后端：PDF生成工具 (server/utils/createPdf.js 核心片段)

```javascript
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

      // 注册中文字体（微软雅黑）
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

      // 渲染报告内容（移除Markdown标记）
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

function removeMarkdown(text) {
  return String(text)
    .replace(/\*\*(.+?)\*\*/g, "$1")  // 移除加粗
    .replace(/\*(.+?)\*/g, "$1")      // 移除斜体
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")  // 移除链接
    .replace(/^#+\s+/gm, "")          // 移除标题标记
    .replace(/[✅⚠️❌]/g, "")          // 移除Emoji
    .trim();
}
```

### 前端：PDF下载API (client/src/api/report.js)

```javascript
export const downloadReportApi = async (reportId) => {
  const baseURL = "http://localhost:3000/api";
  const response = await fetch(`${baseURL}/reports/${reportId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) throw new Error("下载失败");

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `report_${Date.now()}.pdf`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename\*?=(['"]?)(.+)\1/);
    if (match && match[2]) filename = decodeURIComponent(match[2]);
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return { success: true };
};
```

### 前端：删除报告API (client/src/api/report.js)

```javascript
export const deleteReportApi = async (reportId) => {
  const response = await apiClient.delete(`/reports/${reportId}`);
  return response;
};
```
