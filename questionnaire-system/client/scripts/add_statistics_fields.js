import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 db.json 文件
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 为每个 survey 的每个问题的每个选项添加 selectedCount 字段
if (db.surveys && Array.isArray(db.surveys)) {
  db.surveys.forEach(survey => {
    if (survey.questionList && Array.isArray(survey.questionList)) {
      survey.questionList.forEach(question => {
        if (question.options && Array.isArray(question.options)) {
          question.options = question.options.map(option => ({
            ...option,
            selectedCount: option.selectedCount || 0
          }));
        }
      });
    }
  });
}

// 写回 db.json 文件
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ 已成功为所有问卷选项添加 selectedCount 统计字段');
