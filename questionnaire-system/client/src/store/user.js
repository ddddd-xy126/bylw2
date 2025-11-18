import { defineStore } from "pinia";
import { ElMessage } from "element-plus";
import apiClient from "@/api/index";

// 积分奖励配置
export const POINTS_CONFIG = {
  // 问卷相关
  COMPLETE_SURVEY: 10, // 完成问卷
  CREATE_SURVEY: 50, // 创建问卷
  PUBLISH_SURVEY: 30, // 发布问卷
  SURVEY_APPROVED: 20, // 问卷审核通过

  // 互动相关
  ADD_COMMENT: 5, // 发表评论
  RECEIVE_RATING: 2, // 收到评分
  ADD_FAVORITE: 3, // 收藏问卷

  // 登录相关
  DAILY_LOGIN: 5, // 每日登录
  CONTINUOUS_LOGIN_3: 10, // 连续登录3天
  CONTINUOUS_LOGIN_7: 30, // 连续登录7天
  CONTINUOUS_LOGIN_30: 100, // 连续登录30天

  // 社交相关
  SHARE_SURVEY: 5, // 分享问卷
  INVITE_USER: 20, // 邀请用户

  // 其他
  PROFILE_COMPLETE: 15, // 完善个人资料
  FIRST_SURVEY: 20, // 首次完成问卷(额外奖励)
  FIRST_LOGIN: 5, // 首次登录奖励(展示用，默认与每日登录相同)
};

export const useUserStore = defineStore("user", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    profile: (() => {
      const profileData = localStorage.getItem("profile");
      if (!profileData || profileData === "undefined") {
        return null;
      }
      try {
        return JSON.parse(profileData);
      } catch {
        return null;
      }
    })(),
    favorites: [],
    answers: [],
    achievements: null,
    reports: [],
    // 积分相关统计
    todayPoints: 0, // 今日获得积分
    pointsHistory: [], // 积分历史记录
    lastLoginDate: null, // 上次登录日期
    continuousLoginDays: 0, // 连续登录天数
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.profile?.role === "admin",
    userName: (state) => state.profile?.username || "用户",
    userId: (state) => state.profile?.id || null,
    userPoints: (state) => state.profile?.points || 0,
    userLevel: (state) => state.profile?.level || 1,
  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token);
    },
    setProfile(profile) {
      this.profile = profile;
      localStorage.setItem("profile", JSON.stringify(profile));
    },
    setUserData(data) {
      this.favorites = Array.isArray(data.favorites) ? data.favorites : [];
      this.answers = Array.isArray(data.answers) ? data.answers : [];
      this.achievements = data.achievements;
      this.reports = Array.isArray(data.reports) ? data.reports : [];
    },
    addFavorite(surveyId) {
      const favoritesArray = Array.isArray(this.favorites)
        ? this.favorites
        : [];
      if (!favoritesArray.some((fav) => fav.questionnaireId === surveyId)) {
        this.favorites = [...favoritesArray, { questionnaireId: surveyId }];
      }
    },
    removeFavorite(surveyId) {
      const favoritesArray = Array.isArray(this.favorites)
        ? this.favorites
        : [];
      this.favorites = favoritesArray.filter(
        (fav) => fav.questionnaireId !== surveyId
      );
    },

    /**
     * 增加用户积分
     */
    async addPoints(points, reason = "获得积分", showMessage = true) {
      if (!this.profile?.id) {
        console.error("用户未登录，无法增加积分");
        return false;
      }

      // 管理员不参与积分系统
      if (this.profile.role === "admin") {
        console.log("管理员不参与积分系统");
        return false;
      }

      try {
        const currentPoints = this.profile.points || 0;
        const newPoints = currentPoints + points;

        // 计算新等级（每500积分升一级）
        const newLevel = Math.floor(newPoints / 500) + 1;

        // 更新数据库
        await apiClient.patch(`/users/${this.profile.id}`, {
          points: newPoints,
          level: newLevel,
          updatedAt: new Date().toISOString(),
        });

        // 更新本地状态
        this.profile = {
          ...this.profile,
          points: newPoints,
          level: newLevel,
        };

        // 保存到 localStorage
        localStorage.setItem("profile", JSON.stringify(this.profile));

        // 更新今日积分
        this.todayPoints += points;

        // 记录积分历史
        this.pointsHistory.unshift({
          points,
          reason,
          timestamp: new Date().toISOString(),
          totalPoints: newPoints,
        });

        // 显示提示消息
        if (showMessage) {
          ElMessage.success({
            message: `${reason} +${points}积分`,
            duration: 2000,
          });
        }

        // 检查是否升级
        if (newLevel > (this.profile.level || 1)) {
          setTimeout(() => {
            ElMessage.success({
              message: `🎉 恭喜升级到 Lv.${newLevel}！`,
              duration: 3000,
            });
          }, 500);
        }

        return true;
      } catch (error) {
        console.error("增加积分失败:", error);
        return false;
      }
    },

    /**
     * 检查并奖励每日登录积分（用于进入首页时触发）
     * 注意：首次登录（loginCount 为 0 或未设置）不在此处处理
     */
    async checkDailyLogin() {
      if (!this.profile?.id) return;
      if (this.profile.role === "admin") return;

      try {
        const today = new Date().toDateString();
        const lastLogin = this.profile.lastLoginAt
          ? new Date(this.profile.lastLoginAt).toDateString()
          : null;

        // 如果今天还没有登录过
        if (lastLogin !== today) {
          // 如果 loginCount 为 0 或未设置，说明应由首次登录逻辑处理（不在此处重复发放每日登录奖励）
          if (!this.profile.loginCount || this.profile.loginCount <= 0) {
            return;
          }

          // 检查连续登录天数
          let continuousDays = this.profile.continuousLoginDays || 0;

          if (lastLogin) {
            const lastLoginDate = new Date(lastLogin);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastLoginDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              continuousDays += 1;
            } else {
              continuousDays = 1;
            }
          } else {
            continuousDays = 1;
          }

          const newLoginCount = (this.profile.loginCount || 0) + 1;

          // 更新数据库（非首次登录时在首页触发）
          await apiClient.patch(`/users/${this.profile.id}`, {
            lastLoginAt: new Date().toISOString(),
            continuousLoginDays: continuousDays,
            loginCount: newLoginCount,
          });

          // 更新本地状态
          this.profile.lastLoginAt = new Date().toISOString();
          this.profile.continuousLoginDays = continuousDays;
          this.profile.loginCount = newLoginCount;
          this.continuousLoginDays = continuousDays;

          // 每日登录奖励（在首页显示）
          await this.addPoints(POINTS_CONFIG.DAILY_LOGIN, "每日登录奖励");

          // 连续登录额外奖励
          if (continuousDays === 3) {
            await this.addPoints(
              POINTS_CONFIG.CONTINUOUS_LOGIN_3,
              "连续登录3天奖励"
            );
          } else if (continuousDays === 7) {
            await this.addPoints(
              POINTS_CONFIG.CONTINUOUS_LOGIN_7,
              "连续登录7天奖励"
            );
          } else if (continuousDays === 30) {
            await this.addPoints(
              POINTS_CONFIG.CONTINUOUS_LOGIN_30,
              "连续登录30天奖励"
            );
          }
        }
      } catch (error) {
        console.error("每日登录检查失败:", error);
      }
    },

    // 处理登录后的首次/非首次逻辑：
    // - 首次登录（loginCount 为 0 或未设置）：直接发放 "首次登录奖励" 并将 loginCount 设为 1
    // - 非首次登录：不在登录页发放每日登录奖励，首页会调用 checkDailyLogin() 来发放
    async handlePostLogin() {
      if (!this.profile?.id) return { firstLogin: false };
      if (this.profile.role === "admin") return { firstLogin: false };

      try {
        const loginCount = this.profile.loginCount || 0;

        if (!loginCount || loginCount <= 0) {
          // 首次登录
          const newLoginCount = 1;
          const continuousDays = 1;

          await apiClient.patch(`/users/${this.profile.id}`, {
            lastLoginAt: new Date().toISOString(),
            continuousLoginDays: continuousDays,
            loginCount: newLoginCount,
          });

          this.profile.lastLoginAt = new Date().toISOString();
          this.profile.continuousLoginDays = continuousDays;
          this.profile.loginCount = newLoginCount;
          this.continuousLoginDays = continuousDays;

          // 首次登录奖励（只在登录时弹出）
          await this.addPoints(POINTS_CONFIG.FIRST_LOGIN, "首次登录奖励");

          return { firstLogin: true };
        }

        return { firstLogin: false };
      } catch (error) {
        console.error("处理登录后逻辑失败:", error);
        return { firstLogin: false };
      }
    },

    /**
     * 重置每日统计
     */
    resetDailyStats() {
      this.todayPoints = 0;
    },

    logout() {
      this.token = "";
      this.profile = null;
      this.favorites = [];
      this.answers = [];
      this.achievements = null;
      this.reports = [];
      this.todayPoints = 0;
      this.pointsHistory = [];
      this.continuousLoginDays = 0;
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
    },
  },
});
