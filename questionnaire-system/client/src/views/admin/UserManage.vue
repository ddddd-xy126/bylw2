<template>
  <div class="admin-um">
    <el-page-header content="后台 - 用户管理" @back="$router.push('/admin')" />
    <el-card style="margin-top: 16px">
      <div style="margin-bottom: 12px">
        <el-button type="primary" @click="fetch">刷新</el-button>
      </div>
      <el-table :data="items">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="role" label="角色" width="120" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import request from "@/api/index";
const items = ref([]);
const fetch = async () => {
  const { items: list } = await request.get("/admin/users");
  items.value = list;
};
onMounted(fetch);
</script>

<style scoped>
.admin-um {
  padding: 16px;
}
</style>
