<template>
  <div class="admin-q">
    <el-page-header content="后台 - 题目管理" @back="$router.push('/admin')" />
    <el-card style="margin-top: 16px">
      <div style="margin-bottom: 12px; display: flex; gap: 8px">
        <el-button type="primary" @click="openCreate">新建题目</el-button>
        <el-button @click="fetch">刷新</el-button>
      </div>
      <el-table :data="items">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="questionnaireId" label="问卷ID" width="120" />
        <el-table-column prop="type" label="题型" width="120" />
        <el-table-column prop="content" label="内容" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="remove(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="新建题目" v-model:visible="showDialog">
      <el-form :model="form">
        <el-form-item label="问卷ID"
          ><el-input v-model="form.questionnaireId"
        /></el-form-item>
        <el-form-item label="题型"
          ><el-input v-model="form.type"
        /></el-form-item>
        <el-form-item label="内容"
          ><el-input v-model="form.content"
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="create">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import request from "@/api/index";
const items = ref([]);
const showDialog = ref(false);
const form = ref({ questionnaireId: "", type: "", content: "" });
const fetch = async () => {
  const { items: list } = await request.get("/admin/questions");
  items.value = list;
};
const openCreate = () => {
  showDialog.value = true;
};
const create = async () => {
  await request.post("/admin/questions", form.value);
  showDialog.value = false;
  await fetch();
};
const remove = async (id) => {
  await request.delete(`/admin/questions/${id}`);
  await fetch();
};
onMounted(fetch);
</script>

<style scoped>
.admin-q {
  padding: 16px;
}
</style>
