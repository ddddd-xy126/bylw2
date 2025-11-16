const fs = require("fs");
const path = require("path");
const {
  sequelize,
  User,
  Survey,
  Answer,
  Comment,
  Favorite,
  Category,
  Announcement,
  PointHistory,
  AdminActivity,
  Badge,
  RecycleBin,
  UserBadge,
  ActivityData,
} = require("../models");

async function importData() {
  try {
    console.log("🔄 开始从 db.json 导入数据...\n");

    // 读取 db.json
    const dbPath = path.join(__dirname, "../../client/db.json");

    if (!fs.existsSync(dbPath)) {
      console.error(`❌ 文件不存在: ${dbPath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    // 连接数据库
    await sequelize.authenticate();
    console.log("✅ 数据库连接成功\n");

    // 同步表结构
    await sequelize.sync({ force: true }); // 注意：force: true 会删除现有数据
    console.log("✅ 数据库表结构已创建\n");

    // 1. 导入分类
    if (data.categories && data.categories.length > 0) {
      await Category.bulkCreate(data.categories, {
        updateOnDuplicate: ["name", "slug", "description", "color", "icon"],
      });
      console.log(`✅ 导入 ${data.categories.length} 个分类`);
    }

    // 2. 导入用户（需要处理密码）
    if (data.users && data.users.length > 0) {
      try {
        const users = data.users.map((user) => ({
          id: user.id, // 保持原始 ID（支持字符串）
          username: user.username,
          email: user.email,
          password: user.password,
          nickname: user.nickname || user.username,
          avatar:
            user.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          phone: user.phone,
          role: user.role || "user",
          banned: user.banned || false,
          isActive: user.isActive !== undefined ? user.isActive : true,
          points: user.points || 0,
          level: user.level || 1,
          gender: user.gender,
          age: user.age,
          city: user.city,
          bio: user.bio,
          profession: user.profession,
          joinedDate: user.joinedDate,
          lastLoginAt: user.lastLoginAt,
          lastLoginIp: user.lastLoginIp,
          tags: user.tags,
          completedSurveys: user.completedSurveys,
          continuousLoginDays: user.continuousLoginDays || 0,
          unlockedBadges: user.unlockedBadges,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt || user.createdAt,
        }));

        for (const user of users) {
          await User.create(user);
        }
        console.log(`✅ 导入 ${users.length} 个用户`);
      } catch (error) {
        console.error(`❌ 导入用户失败:`, error.message);
      }
    }

    // 3. 导入问卷（包括模板）
    if (data.surveys && data.surveys.length > 0) {
      try {
        const surveys = data.surveys.map((survey) => ({
          id: survey.id,
          userId: survey.userId || survey.creatorId || survey.authorId || "3",
          title: survey.title,
          description: survey.description,
          category: survey.category,
          categoryId: survey.categoryId,
          tags: survey.tags,
          questions: survey.questions,
          questionList: survey.questionList || survey.questions,
          settings: survey.settings,
          status: survey.status || "published",
          isTemplate: survey.isTemplate || false, // 确保模板字段被保留
          authorId: survey.authorId,
          authorName: survey.authorName,
          author: survey.author,
          creatorId: survey.creatorId,
          participants: survey.participants || 0,
          participantCount: survey.participantCount || survey.participants || 0,
          responses: survey.responses || 0,
          responseCount: survey.responseCount || survey.responses || 0,
          rating: survey.rating || 0,
          averageRating: survey.averageRating || survey.rating || 0,
          ratingCount: survey.ratingCount || 0,
          favoriteCount: survey.favoriteCount || 0,
          duration: survey.duration,
          estimatedTime: survey.estimatedTime || survey.duration,
          thumbnail: survey.thumbnail,
          answerCount: survey.answerCount || 0,
          publishedAt: survey.publishedAt || survey.createdAt,
          createdAt: survey.createdAt,
          updatedAt: survey.updatedAt || survey.createdAt,
        }));
        await Survey.bulkCreate(surveys, { ignoreDuplicates: true });
        console.log(
          `✅ 导入 ${surveys.length} 个问卷（包括 ${
            surveys.filter((s) => s.isTemplate).length
          } 个模板）`
        );

        // 提取嵌套的 answers 和 comments
        const allAnswers = [];
        const allComments = [];

        data.surveys.forEach((survey) => {
          if (survey.answers && Array.isArray(survey.answers)) {
            survey.answers.forEach((answer) => {
              // 过滤有效的用户ID
              const userId = parseInt(answer.userId);
              if (!isNaN(userId) && userId > 0) {
                allAnswers.push({
                  id: answer.id,
                  userId: userId,
                  surveyId: survey.id,
                  surveyTitle: survey.title,
                  answers: answer.answers || [],
                  score: answer.score,
                  result: answer.result,
                  duration: answer.duration,
                  submittedAt: answer.submittedAt,
                });

                // 提取答案中的评论
                if (answer.comments && Array.isArray(answer.comments)) {
                  answer.comments.forEach((comment) => {
                    const commentUserId = parseInt(comment.userId || userId);
                    if (!isNaN(commentUserId) && commentUserId > 0) {
                      allComments.push({
                        id: comment.id,
                        userId: commentUserId,
                        surveyId: survey.id,
                        username: comment.username,
                        avatar: comment.avatar,
                        rating: comment.rating,
                        content: comment.content,
                        isDeleted: comment.isDeleted || false,
                        createdAt: comment.createdAt,
                        updatedAt: comment.updatedAt || comment.createdAt,
                      });
                    }
                  });
                }
              }
            });
          }
        });

        // 导入提取的答案
        if (allAnswers.length > 0) {
          try {
            await Answer.bulkCreate(allAnswers, { ignoreDuplicates: true });
            console.log(`✅ 从问卷中导入 ${allAnswers.length} 个答案`);
          } catch (error) {
            console.error(`❌ 导入答案失败:`, error.message);
          }
        }

        // 导入提取的评论
        if (allComments.length > 0) {
          try {
            await Comment.bulkCreate(allComments, { ignoreDuplicates: true });
            console.log(`✅ 从答案中导入 ${allComments.length} 个评论`);
          } catch (error) {
            console.error(`❌ 导入评论失败:`, error.message);
          }
        }
      } catch (error) {
        console.error(`❌ 导入问卷失败:`, error.message);
      }
    }

    // 4. 导入答案
    if (data.answers && data.answers.length > 0) {
      try {
        await Answer.bulkCreate(data.answers, { ignoreDuplicates: true });
        console.log(`✅ 导入 ${data.answers.length} 个答案`);
      } catch (error) {
        console.error(`❌ 导入答案失败:`, error.message);
      }
    }

    // 5. 导入评论
    if (data.comments && data.comments.length > 0) {
      try {
        await Comment.bulkCreate(data.comments, { ignoreDuplicates: true });
        console.log(`✅ 导入 ${data.comments.length} 个评论`);
      } catch (error) {
        console.error(`❌ 导入评论失败:`, error.message);
      }
    }

    // 6. 导入收藏
    if (data.favorites && data.favorites.length > 0) {
      try {
        await Favorite.bulkCreate(data.favorites, { ignoreDuplicates: true });
        console.log(`✅ 导入 ${data.favorites.length} 个收藏`);
      } catch (error) {
        console.error(`❌ 导入收藏失败:`, error.message);
      }
    }

    // 7. 导入公告
    if (data.announcements && data.announcements.length > 0) {
      try {
        const announcements = data.announcements.map((ann) => ({
          id: ann.id,
          title: ann.title,
          content: ann.content,
          type: ann.type || "info",
          status: ann.status || "published",
          isActive: ann.isActive !== undefined ? ann.isActive : true,
          priority: ann.priority || 0,
          publishedAt: ann.publishedAt,
          createdBy: ann.createdBy || 3,
          createdAt: ann.createdAt || ann.publishedAt,
          updatedAt: ann.updatedAt || ann.publishedAt,
        }));
        await Announcement.bulkCreate(announcements, {
          ignoreDuplicates: true,
        });
        console.log(`✅ 导入 ${announcements.length} 个公告`);
      } catch (error) {
        console.error(`❌ 导入公告失败:`, error.message);
      }
    }

    // 8. 导入积分历史（如果存在）
    if (data.pointHistories && data.pointHistories.length > 0) {
      try {
        await PointHistory.bulkCreate(data.pointHistories, {
          ignoreDuplicates: true,
        });
        console.log(`✅ 导入 ${data.pointHistories.length} 条积分历史`);
      } catch (error) {
        console.error(`❌ 导入积分历史失败:`, error.message);
      }
    }

    // 9. 导入徽章（如果存在）
    if (data.badges && data.badges.length > 0) {
      try {
        await Badge.bulkCreate(data.badges, {
          ignoreDuplicates: true,
        });
        console.log(`✅ 导入 ${data.badges.length} 个徽章`);
      } catch (error) {
        console.error(`❌ 导入徽章失败:`, error.message);
      }
    }

    // 10. 导入管理员活动日志（如果存在）
    if (data.adminActivities && data.adminActivities.length > 0) {
      try {
        const activities = data.adminActivities.map((activity) => ({
          id: activity.id,
          adminId: activity.adminId,
          adminName: activity.adminName,
          title: activity.title,
          description: activity.description,
          type: activity.type,
          timestamp: activity.timestamp,
        }));
        await AdminActivity.bulkCreate(activities, {
          ignoreDuplicates: true,
        });
        console.log(`✅ 导入 ${activities.length} 条管理员活动日志`);
      } catch (error) {
        console.error(`❌ 导入管理员活动日志失败:`, error.message);
      }
    }

    // 11. 导入回收站（如果存在）
    if (data.recycleBin && data.recycleBin.length > 0) {
      try {
        await RecycleBin.bulkCreate(data.recycleBin, {
          ignoreDuplicates: true,
        });
        console.log(`✅ 导入 ${data.recycleBin.length} 条回收站记录`);
      } catch (error) {
        console.error(`❌ 导入回收站失败:`, error.message);
      }
    }

    // 12. 导入用户成就(achievements -> user_badges)（如果存在）
    if (data.achievements && data.achievements.length > 0) {
      try {
        await UserBadge.bulkCreate(data.achievements, {
          ignoreDuplicates: true,
        });
        console.log(`✅ 导入 ${data.achievements.length} 条用户成就记录`);
      } catch (error) {
        console.error(`❌ 导入用户成就失败:`, error.message);
      }
    }

    // 13. 导入活动统计数据（如果存在）
    if (data.activityData && data.activityData.length > 0) {
      try {
        await ActivityData.bulkCreate(data.activityData, {
          ignoreDuplicates: true,
        });
        console.log(`✅ 导入 ${data.activityData.length} 条活动统计数据`);
      } catch (error) {
        console.error(`❌ 导入活动统计数据失败:`, error.message);
      }
    }

    console.log("\n🎉 数据导入完成！");
    console.log("\n📊 导入统计:");
    console.log(`   - 分类: ${data.categories?.length || 0}`);
    console.log(`   - 用户: ${data.users?.length || 0}`);
    console.log(`   - 问卷: ${data.surveys?.length || 0}`);
    console.log(`   - 答案: ${data.answers?.length || 0}`);
    console.log(`   - 评论: ${data.comments?.length || 0}`);
    console.log(`   - 收藏: ${data.favorites?.length || 0}`);
    console.log(`   - 公告: ${data.announcements?.length || 0}`);
    console.log(`   - 积分历史: ${data.pointHistories?.length || 0}`);
    console.log(`   - 徽章: ${data.badges?.length || 0}`);
    console.log(`   - 管理员活动: ${data.adminActivities?.length || 0}`);
    console.log(`   - 回收站: ${data.recycleBin?.length || 0}`);
    console.log(`   - 用户成就: ${data.achievements?.length || 0}`);
    console.log(`   - 活动统计: ${data.activityData?.length || 0}`);
  } catch (error) {
    console.error("\n❌ 数据导入失败:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  } finally {
    await sequelize.close();
    console.log("\n✅ 数据库连接已关闭");
  }
}

// 运行导入
importData();
