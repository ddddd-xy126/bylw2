<template>
  <div class="rankings-layout">
    <el-page-header content="排行榜" @back="$router.back()" />
    <el-tabs v-model="tab" style="margin-top: 16px">
      <el-tab-pane
        label="参与度"
        name="participation"
        @click="$router.push('/rankings/participation')"
      />
      <el-tab-pane
        label="评分"
        name="rating"
        @click="$router.push('/rankings/rating')"
      />
      <el-tab-pane
        label="用户积分"
        name="user-points"
        @click="$router.push('/rankings/user-points')"
      />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup>
import { ref } from "vue";
const tab = ref("participation");
</script>

<style scoped>
.rankings-layout {
  padding: 16px;
}
</style>
