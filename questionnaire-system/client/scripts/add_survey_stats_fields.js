import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 db.json 文件
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 为每个 survey 添加统计字段
if (db.surveys && Array.isArray(db.surveys)) {
  db.surveys.forEach(survey => {
    // 添加缺失的字段，如果已存在则保留原值
    if (survey.answerCount === undefined) {
      survey.answerCount = survey.participantCount || 0;
    }
    
    if (survey.completionRate === undefined) {
      // 完成率：默认80%，如果有参与人数则随机生成
      survey.completionRate = survey.participantCount > 0 
        ? Math.floor(Math.random() * 30) + 70 // 70-100%
        : 0;
    }
    
    if (survey.favoriteCount === undefined) {
      // 收藏数：大约是参与人数的10-30%
      survey.favoriteCount = survey.participantCount > 0
        ? Math.floor(survey.participantCount * (Math.random() * 0.2 + 0.1))
        : 0;
    }
    
    if (survey.views === undefined) {
      // 浏览量：通常是参与人数的2-5倍
      survey.views = survey.participantCount > 0
        ? Math.floor(survey.participantCount * (Math.random() * 3 + 2))
        : 0;
    }
  });
}

// 写回 db.json 文件
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ 已成功为所有问卷添加统计字段（answerCount, completionRate, favoriteCount, views）');
