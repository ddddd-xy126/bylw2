<template>
  <div class="rankings-layout">
    <div class="rankings-header">
      <h1 class="rankings-title">排行榜</h1>
      <p class="rankings-subtitle">查看各类排行榜数据</p>
    </div>

    <div class="rankings-nav">
      <el-menu :default-active="activeTab" mode="horizontal" @select="handleTabChange" class="rankings-menu">
        <el-menu-item index="participation">参与排行</el-menu-item>
        <el-menu-item index="rating">评分排行</el-menu-item>
        <el-menu-item index="user-points">积分排行</el-menu-item>
      </el-menu>
    </div>

    <div class="rankings-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => {
  const path = route.path;
  if (path.includes('participation')) return 'participation';
  if (path.includes('rating')) return 'rating';
  if (path.includes('user-points')) return 'user-points';
  return 'participation';
});

const handleTabChange = (index) => {
  router.push(`/rankings/${index}`);
};
</script>

<style lang="scss" scoped>
.rankings-layout {
  background-color: var(--theme-background-color);
  margin: 0 auto;
  padding: 30px 285px;

  .rankings-header {
    text-align: center;
    margin-bottom: 30px;

    .rankings-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .rankings-subtitle {
      font-size: 1.1rem;
      color: #7f8c8d;
    }
  }

  .rankings-nav {
    margin-bottom: 30px;

    .rankings-menu {
      justify-content: center;
      border-bottom: 2px solid #e1e8ed;
    }
  }

  .rankings-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
}
</style>