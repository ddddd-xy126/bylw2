<template>
  <div class="home">
    <el-container>
      <el-header>
        <el-row justify="space-between" align="middle">
          <el-col :span="8"><h2>智能问卷分析系统</h2></el-col>
          <el-col :span="8" style="text-align:right">
            <el-button type="primary" @click="$router.push('/login')">登录</el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-empty description="首页占位（分类/推荐/排行榜 等待实现）" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home { padding: 16px; }
</style>


