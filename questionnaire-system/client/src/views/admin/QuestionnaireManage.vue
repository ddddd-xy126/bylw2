<template>
  <div class="admin-qm">
    <el-page-header content="后台 - 问卷管理" @back="$router.push('/admin')" />
    <el-card style="margin-top: 16px">
      <div style="margin-bottom: 12px; display: flex; gap: 8px">
        <el-button type="primary" @click="$router.push('/admin/surveys/create')"
          >新建问卷</el-button
        >
        <el-button @click="fetch">刷新</el-button>
      </div>
      <el-table :data="items">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-popconfirm title="确认删除?" @confirm="remove(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import request from "@/api/index";
const items = ref([]);
const fetch = async () => {
  const { items: list } = await request.get("/questionnaire");
  items.value = list;
};
const remove = async (id) => {
  await request.delete(`/admin/surveys/${id}`);
  await fetch();
};
onMounted(fetch);
</script>

<style scoped>
.admin-qm {
  padding: 16px;
}
</style>
