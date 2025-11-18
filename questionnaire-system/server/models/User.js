const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      comment: "username",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: true,
      comment: "email",
    },
    nickname: {
      type: DataTypes.STRING(50),
    },
    avatar: {
      type: DataTypes.STRING(255),
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "手机号",
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    banned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "是否被封禁",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "账号是否激活",
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "用户等级",
    },
    gender: DataTypes.STRING(20),
    age: DataTypes.INTEGER,
    city: DataTypes.STRING(50),
    bio: DataTypes.TEXT,
    profession: DataTypes.STRING(100),
    joinedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "加入日期",
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "最后登录时间",
    },
    lastLoginIp: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "最后登录IP",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "用户标签",
    },
    completedSurveys: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "已完成的问卷ID列表",
    },
    continuousLoginDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "连续登录天数",
    },
    loginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "登录次数",
    },
    unlockedBadges: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "已解锁的徽章ID列表",
    },
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// 实例方法：验证密码
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 实例方法：转换为安全对象（不包含密码）
User.prototype.toSafeObject = function () {
  const { password, ...safeUser } = this.toJSON();
  return safeUser;
};

module.exports = User;
