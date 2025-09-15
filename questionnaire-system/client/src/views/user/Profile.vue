<template>
  <div class="profile-page">
    <el-page-header content="个人中心" @back="goToHome" />

    <div class="profile-content">
      <!-- 用户信息卡片 -->
      <el-card class="user-info-card">
        <template #header>
          <div class="card-header">
            <span>基础信息</span>
          </div>
        </template>

        <div class="user-profile">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userAvatar">
              {{ userStore.userName.charAt(0) }}
            </el-avatar>
            <div class="user-basic">
              <h3>{{ userStore.userName }}</h3>
              <p>{{ userStore.profile?.email }}</p>
              <el-tag
                :type="userStore.isAdmin ? 'danger' : 'primary'"
                size="small"
              >
                {{ userStore.isAdmin ? "管理员" : "普通用户" }}
              </el-tag>
            </div>
          </div>

          <el-form :model="form" label-width="80px" v-loading="loading">
            <el-form-item label="昵称">
              <el-input
                v-model="form.nickname"
                placeholder="请输入昵称"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" disabled />
            </el-form-item>
            <el-form-item label="注册时间">
              <el-input
                :value="formatDate(userStore.profile?.createdAt)"
                disabled
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="updateProfile"
                :loading="updating"
              >
                保存修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="32" color="#409EFF"><Document /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ userAnswers.length }}</div>
                <div class="stats-label">已答问卷</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="32" color="#67C23A"><Star /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ userFavorites.length }}</div>
                <div class="stats-label">收藏问卷</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="32" color="#E6A23C"><Trophy /></el-icon>
              <div class="stats-content">
                <div class="stats-number">
                  {{ userAchievements?.points || 0 }}
                </div>
                <div class="stats-label">积分</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="32" color="#F56C6C"><Medal /></el-icon>
              <div class="stats-content">
                <div class="stats-number">
                  {{ userAchievements?.badges?.length || 0 }}
                </div>
                <div class="stats-label">徽章</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 成就系统 -->
      <el-card class="achievements-card">
        <template #header>
          <div class="card-header">
            <span>我的成就</span>
            <el-tag type="warning"
              >{{ userAchievements?.points || 0 }} 积分</el-tag
            >
          </div>
        </template>

        <div class="achievements-content">
          <div class="badges-section">
            <h4>已获得徽章</h4>
            <div class="badges-list">
              <el-tag
                v-for="badge in userAchievements?.badges || []"
                :key="badge"
                type="success"
                class="badge-tag"
              >
                🏆 {{ badge }}
              </el-tag>
              <el-empty
                v-if="!userAchievements?.badges?.length"
                description="暂无徽章"
              />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 最近答卷 -->
      <el-card class="recent-answers-card">
        <template #header>
          <div class="card-header">
            <span>最近答卷</span>
            <el-button type="text" @click="$router.push('/user/history')">
              查看全部
            </el-button>
          </div>
        </template>

        <div class="recent-answers">
          <div
            v-for="answer in recentAnswers"
            :key="answer.id"
            class="answer-item"
            @click="viewAnswerDetail(answer)"
          >
            <div class="answer-info">
              <h4>{{ answer.questionnaire?.title || "未知问卷" }}</h4>
              <p>得分：{{ answer.detail?.score || 0 }}分</p>
              <span class="answer-date">{{
                formatDate(answer.createdAt)
              }}</span>
            </div>
            <el-button type="text" @click.stop="viewReport(answer.id)">
              查看报告
            </el-button>
          </div>

          <el-empty v-if="!recentAnswers.length" description="暂无答卷记录" />
        </div>
      </el-card>

      <!-- 我的收藏 -->
      <el-card class="favorites-card">
        <template #header>
          <div class="card-header">
            <span>我的收藏</span>
            <el-button type="text" @click="$router.push('/user/favorites')">
              管理收藏
            </el-button>
          </div>
        </template>

        <div class="favorites-content">
          <el-row :gutter="16">
            <el-col
              :span="12"
              v-for="favorite in recentFavorites"
              :key="favorite.id"
              class="favorite-item"
            >
              <el-card
                shadow="hover"
                @click="goToSurvey(favorite.questionnaireId)"
              >
                <h4>{{ favorite.questionnaire?.title || "未知问卷" }}</h4>
                <p>{{ favorite.questionnaire?.description || "暂无描述" }}</p>
                <div class="favorite-actions">
                  <el-button type="primary" size="small">开始答题</el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click.stop="removeFavorite(favorite.questionnaireId)"
                  >
                    取消收藏
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-empty v-if="!recentFavorites.length" description="暂无收藏" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Document, Star, Trophy, Medal } from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user";
import {
  profileApi,
  getFavoritesApi,
  getUserAnswersApi,
  getUserAchievementsApi,
  removeFavoriteApi,
} from "@/api/user";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const updating = ref(false);
const userAnswers = ref([]);
const userFavorites = ref([]);
const userAchievements = ref(null);

const form = reactive({
  nickname: "",
  email: "",
});

// 计算属性
const userAvatar = computed(() => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${userStore.userName}`;
});

const recentAnswers = computed(() => {
  return userAnswers.value.slice(0, 5);
});

const recentFavorites = computed(() => {
  return userFavorites.value.slice(0, 4);
});

// 方法
const loadUserData = async () => {
  loading.value = true;
  try {
    // 加载用户资料
    const profile = await profileApi();
    userStore.setProfile(profile);

    // 更新表单
    form.nickname = profile.nickname || "";
    form.email = profile.email || "";

    // 加载用户数据
    const [favorites, answers, achievements] = await Promise.all([
      getFavoritesApi(),
      getUserAnswersApi(),
      getUserAchievementsApi(),
    ]);

    userFavorites.value = favorites;
    userAnswers.value = answers;
    userAchievements.value = achievements;

    userStore.setUserData({ favorites, answers, achievements });
  } catch (error) {
    ElMessage.error("加载用户数据失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  if (!form.nickname.trim()) {
    ElMessage.warning("请输入昵称");
    return;
  }

  updating.value = true;
  try {
    // 这里需要后端提供更新接口
    ElMessage.success("个人信息更新成功");
    userStore.setProfile({ ...userStore.profile, nickname: form.nickname });
  } catch (error) {
    ElMessage.error("更新失败：" + error.message);
  } finally {
    updating.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("zh-CN");
};

const goToSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

const viewAnswerDetail = (answer) => {
  router.push(`/user/answers/${answer.id}`);
};

const viewReport = (answerId) => {
  router.push(`/user/reports/${answerId}`);
};

const removeFavorite = async (surveyId) => {
  try {
    await removeFavoriteApi(surveyId);
    userFavorites.value = userFavorites.value.filter(
      (fav) => fav.questionnaireId !== surveyId
    );
    const favoritesArray = Array.isArray(userStore.favorites)
      ? userStore.favorites
      : [];
    userStore.favorites = favoritesArray.filter(
      (fav) => fav.questionnaireId !== surveyId
    );
    ElMessage.success("取消收藏成功");
  } catch (error) {
    ElMessage.error("操作失败：" + error.message);
  }
};

const goToHome = () => {
  // 根据用户角色智能导航
  if (userStore.isAdmin) {
    router.push("/admin/dashboard");
  } else {
    router.push("/home");
  }
};

// 生命周期
onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-content {
  margin-top: 20px;
}

.user-info-card,
.achievements-card,
.recent-answers-card,
.favorites-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-profile {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.user-basic h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.user-basic p {
  margin: 0 0 8px 0;
  color: #666;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 100px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stats-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.achievements-content {
  padding: 16px 0;
}

.badges-section h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.badges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge-tag {
  font-size: 14px;
  padding: 8px 12px;
}

.recent-answers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.answer-item:hover {
  border-color: #409eff;
  background-color: #f8faff;
}

.answer-info h4 {
  margin: 0 0 4px 0;
  color: #333;
}

.answer-info p {
  margin: 0 0 4px 0;
  color: #666;
}

.answer-date {
  font-size: 12px;
  color: #999;
}

.favorites-content {
  padding: 16px 0;
}

.favorite-item {
  margin-bottom: 16px;
}

.favorite-item .el-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-item .el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.favorite-item h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.favorite-item p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.favorite-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .stats-row .el-col {
    margin-bottom: 12px;
  }

  .answer-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
