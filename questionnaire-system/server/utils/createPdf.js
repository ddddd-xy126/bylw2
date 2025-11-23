// server/utils/createPdf.js
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// 颜色与样式配置（与你选的 2A/3A 风格匹配）
const THEME = {
  primary: "#A6D6A8", // 柔和浅绿
  textColor: "#303133",
  cardBg: "#F2FAF2",
  pageWidth: 595.28, // A4 pt (approx 72dpi): 595.28 x 841.89
  pageHeight: 841.89,
  margin: 48,
};

function drawCard(doc, x, y, w, h, radius = 8, fill = THEME.cardBg) {
  // rounded rectangle filled
  doc.roundedRect(x, y, w, h, radius).fill(fill);
}

/**
 * 移除Markdown标记，转为纯文本
 */
function removeMarkdown(text) {
  if (!text) return "";
  return String(text)
    // 移除加粗 **text**
    .replace(/\*\*(.+?)\*\*/g, "$1")
    // 移除斜体 *text*
    .replace(/\*(.+?)\*/g, "$1")
    // 移除链接 [text](url)
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    // 移除代码块 ```
    .replace(/```[\s\S]*?```/g, "")
    // 移除行内代码 `code`
    .replace(/`(.+?)`/g, "$1")
    // 移除标题 #
    .replace(/^#+\s+/gm, "")
    // 移除列表符号
    .replace(/^[-*+]\s+/gm, "")
    .trim();
}

/**
 * generate PDF file from report object
 * @param {Object} report { title, subtitle, author, surveyTitle, generatedAt, content }
 * @returns {Promise<string>} filePath
 */
function createPdf(report = {}) {
  return new Promise((resolve, reject) => {
    try {
      if (!report) report = {};
      const fileName = `report_${Date.now()}.pdf`;
      const tmpDir = path.join(__dirname, "../tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const filePath = path.join(tmpDir, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: THEME.margin,
        info: {
          Title: report.title || "个人分析报告",
          Author: report.author || "系统生成",
        },
      });

      // 尝试注册中文字体（必须，否则乱码）
      let useCustomFont = false;
      let fontName = "ChineseFont";

      // Windows 系统字体路径（按优先级尝试）
      const systemFonts = [
        { path: "C:\\Windows\\Fonts\\msyh.ttc", name: "Microsoft YaHei" },
        { path: "C:\\Windows\\Fonts\\simhei.ttf", name: "SimHei" },
        { path: "C:\\Windows\\Fonts\\simsun.ttc", name: "SimSun" },
        { path: "C:\\Windows\\Fonts\\simkai.ttf", name: "KaiTi" },
      ];

      // 尝试加载系统字体
      for (const font of systemFonts) {
        if (fs.existsSync(font.path)) {
          try {
            doc.registerFont(fontName, font.path);
            doc.font(fontName);
            useCustomFont = true;
            console.log(`✅ 成功加载字体: ${font.name} (${font.path})`);
            break;
          } catch (e) {
            console.warn(`⚠️ 字体加载失败: ${font.name}`, e.message);
          }
        }
      }

      // 如果系统字体失败，尝试自定义字体
      const roundedFontPath = path.join(
        __dirname,
        "../fonts/SourceHanRoundedSC-Regular.otf"
      );
      if (!useCustomFont && fs.existsSync(roundedFontPath)) {
        try {
          doc.registerFont(fontName, roundedFontPath);
          doc.font(fontName);
          useCustomFont = true;
          console.log("✅ 成功加载自定义字体");
        } catch (e) {
          console.warn("⚠️ 无法加载自定义字体:", e.message);
        }
      }

      if (!useCustomFont) {
        console.error("❌ 所有中文字体加载失败！PDF将显示乱码！");
        throw new Error("无法加载中文字体，请确保系统安装了中文字体");
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // 设置字体
      doc.font(fontName);

      // 简单的页眉
      const author = report.author || report.nickname || "用户";
      const dateStr = report.generatedAt || new Date().toLocaleString("zh-CN", { hour12: false });
      
      doc.fontSize(10).fillColor("#666");
      doc.text(`${report.surveyTitle || "问卷分析报告"}`, { align: "center" });
      doc.text(`用户：${author}  生成时间：${dateStr}`, { align: "center" });
      doc.moveDown(2);

      // 移除Markdown标记
      const cleanContent = removeMarkdown(report.content || "");
      
      // 直接输出纯文本，无任何样式
      doc.fontSize(12).fillColor("#303133");
      doc.text(cleanContent, {
        align: "left",
        lineGap: 4
      });

      // 结束文档
      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = createPdf;
