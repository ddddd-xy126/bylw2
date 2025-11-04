import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 读取 db.json
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

console.log(`总共有 ${db.surveys.length} 个 surveys`);

// 统计已有 isTemplate 字段的数量
const hasIsTemplateCount = db.surveys.filter(s => s.hasOwnProperty('isTemplate')).length;
console.log(`已有 isTemplate 字段的: ${hasIsTemplateCount} 个`);

// 给所有 survey 添加 isTemplate 字段(如果还没有)
let addedCount = 0;
db.surveys.forEach((survey, index) => {
  if (!survey.hasOwnProperty('isTemplate')) {
    survey.isTemplate = false;
    addedCount++;
  }
});

console.log(`新添加 isTemplate: false 字段的: ${addedCount} 个`);

// 写回文件
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

console.log('✅ db.json 已更新!');
console.log(`\n所有 ${db.surveys.length} 个 surveys 现在都有 isTemplate 字段了`);
