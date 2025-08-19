<template>
  <div class="profile-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="$route.path" router>
          <el-menu-item index="/profile/info">资料</el-menu-item>
          <el-menu-item index="/profile/creations">我的创作</el-menu-item>
          <el-menu-item index="/profile/history">历史</el-menu-item>
          <el-menu-item index="/profile/collections">收藏</el-menu-item>
          <el-menu-item index="/profile/achievements">成就</el-menu-item>
          <el-menu-item index="/profile/reports">报告</el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup></script>

<style scoped>
.profile-layout {
  padding: 16px;
}
</style>
