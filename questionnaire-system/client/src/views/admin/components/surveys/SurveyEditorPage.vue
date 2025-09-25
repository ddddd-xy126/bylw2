<template>
  <div class="admin-survey-editor">
    <el-page-header
      :content="isEdit ? '编辑问卷' : '新建问卷'"
      @back="$router.push('/admin/surveys')"
    />
    <el-card style="margin-top: 16px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"
          ><el-input v-model="form.title"
        /></el-form-item>
        <el-form-item label="描述"
          ><el-input v-model="form.description" type="textarea" rows="4"
        /></el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import request from "@/api/index";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => !!route.params.id);
const form = reactive({ title: "", description: "" });

async function save() {
  if (isEdit.value) {
    // 占位：保存编辑
  } else {
    // use admin endpoint when inside admin routes
    if (router.currentRoute.value.path.startsWith("/admin")) {
      await request.post("/admin/surveys", form);
    } else {
      await request.post("/questionnaire", form);
    }
  }
  router.push("/admin/surveys");
}
</script>

<style scoped>
.admin-survey-editor {
  padding: 16px;
}
</style>
