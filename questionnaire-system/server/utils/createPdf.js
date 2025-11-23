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

      // 尝试注册自定义字体（可选，如果没有字体文件会使用系统字体）
      const roundedFontPath = path.join(
        __dirname,
        "../fonts/SourceHanRoundedSC-Regular.otf"
      );

      let useCustomFont = false;

      // 优先尝试系统中文字体（更稳定）
      const systemFonts = [
        "C:/Windows/Fonts/msyh.ttc", // 微软雅黑
        "C:/Windows/Fonts/simhei.ttf", // 黑体
        "C:/Windows/Fonts/simsun.ttc", // 宋体
      ];

      for (const fontPath of systemFonts) {
        if (fs.existsSync(fontPath)) {
          try {
            doc.registerFont("SystemCN", fontPath);
            doc.font("SystemCN");
            useCustomFont = true;
            console.log("✅ 成功加载系统字体:", fontPath);
            break;
          } catch (e) {
            console.warn("⚠️ 尝试加载字体失败:", fontPath, e.message);
          }
        }
      }

      // 如果系统字体也失败，尝试自定义字体
      if (!useCustomFont && fs.existsSync(roundedFontPath)) {
        try {
          doc.registerFont("Rounded", roundedFontPath);
          doc.font("Rounded");
          useCustomFont = true;
          console.log("✅ 成功加载自定义字体");
        } catch (e) {
          console.warn("⚠️ 无法加载自定义字体，使用默认字体:", e.message);
        }
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const usableWidth = THEME.pageWidth - THEME.margin * 2;

      // --- 封面页（居中式） ---
      const title = report.title || "AI 个性化分析报告";
      const subtitle = report.subtitle || report.surveyTitle || "";
      const author = report.author || report.nickname || "用户";
      const dateStr =
        report.generatedAt ||
        new Date().toLocaleString("zh-CN", { hour12: false });

      // 封面背景（浅绿顶部条）
      const coverTopHeight = 140;
      doc.rect(0, 0, THEME.pageWidth, coverTopHeight).fill(THEME.primary);

      doc.fillColor("#fff");
      doc.fontSize(26).text(title, 0, 60, {
        align: "center",
      });

      doc.fontSize(12).fillColor("#ffffffcc").text(subtitle, 0, 96, {
        align: "center",
      });

      // 封面底部显示用户信息
      doc.moveDown(4);
      doc.fillColor(THEME.textColor);
      doc.addPage();

      // --- 正文页面起始 ---
      let currentPage = 1;

      // 设置字体
      if (useCustomFont) {
        doc.font("SystemCN");
      }

      // Render report header on first content page
      doc.fillColor(THEME.textColor);
      doc.fontSize(18).text(title, {
        align: "center",
      });
      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .fillColor("#666")
        .text(`用户：${author}    问卷：${report.surveyTitle || ""}`, {
          align: "center",
        });
      doc.moveDown(0.2);
      doc.fontSize(11).fillColor("#888").text(`生成时间：${dateStr}`, {
        align: "center",
      });
      doc.moveDown(1.2);

      // We'll draw content as "卡片式"：每个段落或内容块一个卡片
      const content = report.content || "";
      // 将长内容按双换行拆成段落
      const paragraphs = String(content).split(/\n\s*\n/);

      let y = doc.y; // current y after header

      const cardGap = 14;
      const cardPadding = 12;

      // helper to add footer for current page
      const putFooter = () => {
        doc.fontSize(9).fillColor("#7a7a7a");
        doc.text(`第 ${currentPage} 页`, THEME.margin, THEME.pageHeight - 30, {
          width: usableWidth,
          align: "center",
        });
      };

      // function to draw a paragraph as a card; will manage page breaks
      function drawParagraphAsCard(paragraph) {
        doc.fontSize(12);
        const textOptions = {
          width: usableWidth - cardPadding * 2,
          align: "left",
          lineGap: 6,
        };
        const estimatedHeight = doc.heightOfString(paragraph, textOptions);

        const cardHeight = estimatedHeight + cardPadding * 2;

        // if not enough space on current page, add new page
        const bottomLimit = THEME.pageHeight - THEME.margin - 50;
        if (y + cardHeight + cardGap > bottomLimit) {
          putFooter();
          doc.addPage();
          currentPage++;
          y = THEME.margin;
        }

        // draw rounded rect card
        const rectX = THEME.margin;
        const rectY = y;
        const rectW = usableWidth;
        drawCard(doc, rectX, rectY, rectW, cardHeight, 8, THEME.cardBg);

        // draw text inside with padding
        doc.fillColor(THEME.textColor).fontSize(12);
        doc.text(paragraph, rectX + cardPadding, rectY + cardPadding, {
          width: rectW - cardPadding * 2,
          align: "left",
          lineGap: 6,
        });

        // move y
        y = rectY + cardHeight + cardGap;
      }

      // iterate paragraphs
      for (const para of paragraphs) {
        const cleaned = para.trim();
        if (!cleaned) continue;
        drawParagraphAsCard(cleaned);
      }

      // 最后一页写 footer
      putFooter();

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
