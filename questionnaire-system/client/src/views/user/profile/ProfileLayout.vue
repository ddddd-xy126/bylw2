<template>
  <div class="profile-layout">
    <div class="profile-inner">
      <aside class="left-nav">
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/profile/info">个人信息管理</el-menu-item>
          <el-menu-item index="/profile/collections">收藏管理</el-menu-item>
          <el-menu-item index="/profile/creations">个人问卷</el-menu-item>
          <el-menu-item index="/profile/achievements">个人成就</el-menu-item>
          <el-menu-item index="/profile/reports">个人分析报告</el-menu-item>
        </el-menu>
      </aside>

      <section class="center-content">
        <router-view />
      </section>

      <aside class="right-area">
        <div class="placeholder">侧边信息/广告/统计</div>
      </aside>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.profile-layout {
  padding: 16px;
}
.profile-inner {
  display: flex;
  gap: 16px;
}
.left-nav {
  width: 220px;
}
.center-content {
  flex: 1;
  min-height: 480px;
  background: #fff;
  padding: 16px;
  border: 1px solid #f0f0f0;
}
.right-area {
  width: 240px;
}
.placeholder {
  padding: 12px;
  background: #fafafa;
  border: 1px dashed #eee;
}
</style>
