const sequelize = require("../config/database");
const User = require("./User");
const Survey = require("./Survey");
const Answer = require("./Answer");
const Comment = require("./Comment");
const Favorite = require("./Favorite");
const Category = require("./Category");
const Announcement = require("./Announcement");
const PointHistory = require("./PointHistory");
const AdminActivity = require("./AdminActivity");
const Badge = require("./Badge");
const RecycleBin = require("./RecycleBin");
const Report = require("./Report");

// 定义关联关系

// User - Survey (一对多)
User.hasMany(Survey, { foreignKey: "userId", as: "surveys" });
Survey.belongsTo(User, { foreignKey: "userId", as: "creator" });

// User - Answer (一对多)
User.hasMany(Answer, { foreignKey: "userId", as: "answers" });
Answer.belongsTo(User, { foreignKey: "userId", as: "user" });

// Survey - Answer (一对多)
Survey.hasMany(Answer, { foreignKey: "surveyId", as: "answers" });
Answer.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

// User - Comment (一对多)
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

// Survey - Comment (一对多)
Survey.hasMany(Comment, { foreignKey: "surveyId", as: "comments" });
Comment.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

// User - Favorite (一对多)
User.hasMany(Favorite, { foreignKey: "userId", as: "favorites" });
Favorite.belongsTo(User, { foreignKey: "userId", as: "user" });

// Survey - Favorite (一对多)
Survey.hasMany(Favorite, { foreignKey: "surveyId", as: "favorites" });
Favorite.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

// Category - Survey (一对多)
Category.hasMany(Survey, { foreignKey: "categoryId", as: "surveys" });
Survey.belongsTo(Category, { foreignKey: "categoryId", as: "categoryInfo" });

// User - PointHistory (一对多)
User.hasMany(PointHistory, { foreignKey: "userId", as: "pointHistories" });
PointHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

// User - AdminActivity (一对多)
User.hasMany(AdminActivity, { foreignKey: "adminId", as: "activities" });
AdminActivity.belongsTo(User, { foreignKey: "adminId", as: "admin" });

// User - Report (一对多)
User.hasMany(Report, { foreignKey: "userId", as: "reports" });
Report.belongsTo(User, { foreignKey: "userId", as: "user" });

// Survey - Report (一对多)
Survey.hasMany(Report, { foreignKey: "surveyId", as: "reports" });
Report.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

module.exports = {
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
  Report,
};
