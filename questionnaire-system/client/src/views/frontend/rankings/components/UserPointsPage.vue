<template>
  <div class="user-points-page">
    <el-card class="header-card">
      <div class="page-header">
        <div class="header-icon">👑</div>
        <div class="header-content">
          <h2>用户积分排行榜</h2>
          <p>最活跃的用户排行</p>
        </div>
      </div>
    </el-card>

    <el-card class="rankings-card" v-loading="loading">
      <!-- 前三名特殊展示 -->
      <div class="top-three" v-if="topThree.length > 0">
        <div v-for="(user, index) in topThree" :key="user.id" class="top-item" :class="`rank-${index + 1}`">
          <div class="podium" :class="`podium-${index + 1}`">
            <div class="medal-icon">{{ getMedalIcon(index) }}</div>
            <div class="rank-label">#{{ index + 1 }}</div>
          </div>

          <div class="user-card">
            <div class="user-avatar-wrapper">
              <img v-if="user.avatar" :src="user.avatar" :alt="user.nickname" class="user-avatar" />
              <div v-else class="avatar-placeholder">
                {{ user.nickname ? user.nickname.charAt(0) : '?' }}
              </div>
              <div class="level-badge">Lv.{{ user.level }}</div>
            </div>

            <div class="user-info">
              <h3 class="user-nickname">{{ user.nickname }}</h3>
              <p class="user-bio">{{ user.bio || '这个用户很神秘，什么都没留下' }}</p>

              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-label">积分</span>
                  <span class="stat-value points">{{ user.points }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">等级</span>
                  <span class="stat-value">Lv.{{ user.level }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4-20名列表展示 -->
      <div class="rankings-list" v-if="otherRankings.length > 0">
        <div class="list-header">
          <span class="col-rank">排名</span>
          <span class="col-user">用户信息</span>
          <span class="col-points">积分</span>
          <span class="col-level">等级</span>
          <span class="col-city">城市</span>
        </div>

        <div v-for="(user, index) in otherRankings" :key="user.id" class="list-item">
          <div class="col-rank">
            <span class="rank-number">{{ index + 4 }}</span>
          </div>

          <div class="col-user">
            <div class="user-brief">
              <div class="brief-avatar">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.nickname" />
                <div v-else class="avatar-placeholder-small">
                  {{ user.nickname ? user.nickname.charAt(0) : '?' }}
                </div>
              </div>
              <div class="brief-info">
                <h4 class="brief-nickname">{{ user.nickname }}</h4>
                <p class="brief-profession">{{ user.profession || '未知职业' }}</p>
              </div>
            </div>
          </div>

          <div class="col-points">
            <div class="points-display">
              <el-icon color="#fadb14">
                <TrophyBase />
              </el-icon>
              <span class="points-value">{{ user.points }}</span>
            </div>
          </div>

          <div class="col-level">
            <el-tag :type="getLevelTagType(user.level)" size="small">
              Lv.{{ user.level }}
            </el-tag>
          </div>

          <div class="col-city">
            <span class="city-name">{{ user.city || '未知' }}</span>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && rankings.length === 0" description="暂无排行数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/index.js';
import { ElMessage } from 'element-plus';
import { TrophyBase } from '@element-plus/icons-vue';

const loading = ref(false);
const rankings = ref([]);

// 前三名
const topThree = computed(() => rankings.value.slice(0, 3));

// 4-20名
const otherRankings = computed(() => rankings.value.slice(3, 20));

// 获取奖牌图标
const getMedalIcon = (index) => {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[index] || '';
};

// 获取等级标签类型
const getLevelTagType = (level) => {
  if (level >= 5) return 'danger';
  if (level >= 3) return 'warning';
  return 'success';
};

// 加载排行榜数据
const loadRankings = async () => {
  loading.value = true;
  try {
    // 获取所有用户，按积分降序排列
    const users = await apiClient.get('/users', {
      params: {
        _sort: 'points',
        _order: 'desc',
        _limit: 20
      }
    });
    // 客户端再次排序确保正确（从大到小）
    const sortedUsers = users.sort((a, b) => b.points - a.points);
    rankings.value = sortedUsers.filter(user => user.role !== 'admin');
    console.log('积分排行榜数据:', rankings.value.map(u => ({ nickname: u.nickname, points: u.points })));
  } catch (error) {
    console.error('加载排行榜失败:', error);
    ElMessage.error('加载排行榜失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRankings();
});
</script>

<style lang="scss" scoped>
.user-points-page {
  padding: 20px;

  .header-card {
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--color-primary-light-3) 0%, var(--color-primary) 100%);
    border: none;
    box-shadow: var(--shadow-md);
    border-radius: var(--radius-lg);

    .page-header {
      display: flex;
      align-items: center;
      gap: 20px;
      color: white;

      .header-icon {
        font-size: 48px;
        line-height: 1;
      }

      .header-content {
        h2 {
          margin: 0 0 5px 0;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        p {
          margin: 0;
          font-size: 14px;
          opacity: 0.95;
        }
      }
    }
  }

  .rankings-card {
    overflow: visible;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
  }

  /* 前三名特殊展示 */
  .top-three {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 40px;

    .top-item {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .podium {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 20px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
    }

    .podium-1 {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
      transform: scale(1.05);
    }

    .podium-2 {
      background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    }

    .podium-3 {
      background: linear-gradient(135deg, #cd7f32 0%, #e6a87e 100%);
    }

    .medal-icon {
      font-size: 48px;
      line-height: 1;
    }

    .rank-label {
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }
  }

  .user-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    border: 2px solid #e4e7ed;
    border-radius: 12px;
    background: white;
    transition: all .3s ease;

    &:hover {
      border-color: #43e97b;
      box-shadow: 0 8px 24px rgba(67, 233, 123, 0.2);
      transform: translateY(-5px);
    }

    .user-avatar-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto;
    }

    .user-avatar,
    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .level-badge {
      position: absolute;
      bottom: -5px;
      right: -5px;
      padding: 4px 8px;
      border-radius: 12px;
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .user-info {
      text-align: center;

      .user-nickname {
        font-size: 18px;
        font-weight: 700;
        color: #333;
        margin: 0 0 8px 0;
      }

      .user-bio {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0 0 15px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 40px;
      }
    }

    .user-stats {
      display: flex;
      gap: 20px;
      justify-content: center;
      padding-top: 15px;
      border-top: 1px solid #e4e7ed;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .stat-label {
      font-size: 12px;
      color: #909399;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #333;

      &.points {
        color: #fadb14;
      }
    }
  }

  /* 列表展示 */
  .rankings-list {
    background: white;
  }

  .list-header {
    display: grid;
    grid-template-columns: 80px 1fr 150px 120px 120px;
    gap: 15px;
    padding: 15px 20px;
    background: #f6f8fb;
    border-radius: 8px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }

  .list-item {
    display: grid;
    grid-template-columns: 80px 1fr 150px 120px 120px;
    gap: 15px;
    padding: 15px 20px;
    border-radius: 8px;
    transition: all .3s ease;
    align-items: center;
  }

  .list-item:hover {
    background: #f6f8fb;
    transform: translateX(5px);
  }

  .col-rank {
    text-align: center;
  }

  .rank-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 700;
    font-size: 16px;
  }

  .user-brief {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .brief-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .avatar-placeholder-small {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .brief-info {
    flex: 1;
    min-width: 0;
  }

  .brief-nickname {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 3px 0;
  }

  .brief-profession {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }

  .points-display {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 700;
    color: #fadb14;
  }

  .points-value {
    font-size: 20px;
    color: #333;
  }

  .city-name {
    color: #666;
    font-size: 14px;
  }

  /* 响应式 */
  @media (max-width: 1200px) {
    .top-three {
      grid-template-columns: 1fr;
    }

    .list-header,
    .list-item {
      grid-template-columns: 60px 1fr 120px 100px;
      gap: 10px;
    }

    .col-city {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .list-header {
      display: none;
    }

    .list-item {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .col-rank {
      text-align: left;
    }

    .points-display {
      justify-content: flex-start;
    }
  }
}
</style>